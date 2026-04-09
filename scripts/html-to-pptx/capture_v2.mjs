#!/usr/bin/env node
// v2: DOM-native capture for HTML → PPTX reconstruction.
//
// For each .slide in the HTML file:
//   1. Remove edit toolbar UI, force view-only
//   2. Wait for fonts to load
//   3. DFS walk all descendants, record visible elements with style + bbox
//   4. For SVG roots / transform / ::before elements → rasterize individually
//   5. For text: use Range API to measure each LINE tight bbox
//
// Output:
//   /tmp/pptx-work/v2/{prefix}.json  — slide tree data
//   /tmp/pptx-work/v2/assets/*.png  — rasterized SVG/pseudo/transform elements
//
// Design notes:
// - NO full-slide background PNG. Every visible detail is either a native
//   PPTX shape (rect/rounded-rect/gradient) OR a rasterized mini-asset.
// - Text is measured at the VISUAL LINE level using Range.getClientRects(),
//   so each line becomes its own tight textbox (eliminates font-metric drift).

import { chromium } from '/Users/suni/marketing-ai-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';

const SLIDE_W = 1280;
const SLIDE_H = 720;
const SCALE = 2;

const OUT_DIR = '/tmp/pptx-work/v2';
const ASSETS_DIR = path.join(OUT_DIR, 'assets');
fs.mkdirSync(ASSETS_DIR, { recursive: true });

async function captureFile(htmlPath, prefix) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: SLIDE_W + 80, height: SLIDE_H + 80 },
    deviceScaleFactor: SCALE,
  });
  const page = await context.newPage();
  await page.goto('file://' + htmlPath + '?scroll=1', { waitUntil: 'networkidle' });

  // --- Force view-only mode, strip editor UI globally ---
  await page.evaluate(() => {
    document.documentElement.classList.add('view-only');
    const killSelectors = [
      '#edit-toolbar', '#print-btn', '#slide-modal', '#btn-save-html',
      '[id*="toolbar" i]', '[id*="editor" i]', '[class*="toolbar" i]',
      '[class*="editor" i]',
    ];
    for (const sel of killSelectors) {
      document.querySelectorAll(sel).forEach(e => e.remove());
    }
    const style = document.createElement('style');
    style.textContent = `
      #edit-toolbar,#print-btn,#slide-modal,#btn-save-html,
      [id*="toolbar" i],[id*="editor" i],
      [class*="toolbar" i],[class*="editor" i] { display:none !important; }
      body { background: #ddd9d3 !important; }
    `;
    document.head.appendChild(style);
  });

  // Wait for fonts
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(800);

  const slideCount = await page.locator('.slide').count();
  console.log(`[${prefix}] ${slideCount} slides`);

  const slides = [];

  for (let i = 0; i < slideCount; i++) {
    const slide = page.locator('.slide').nth(i);
    await slide.scrollIntoViewIfNeeded();
    await page.waitForTimeout(50);

    // --- 1. Walk DOM and extract elements ---
    const data = await slide.evaluate((slideEl) => {
      const slideRect = slideEl.getBoundingClientRect();
      const elements = [];
      const assetQueue = []; // index list of elements needing raster
      let order = 0;

      function parseGradient(bgImage) {
        // Extract content of outer linear-gradient(...) with balanced parens
        const prefix = 'linear-gradient(';
        const start = bgImage.indexOf(prefix);
        if (start < 0) return null;
        let depth = 0, end = -1;
        for (let i = start + prefix.length - 1; i < bgImage.length; i++) {
          const ch = bgImage[i];
          if (ch === '(') depth++;
          else if (ch === ')') { depth--; if (depth === 0) { end = i; break; } }
        }
        if (end < 0) return null;
        const inner = bgImage.slice(start + prefix.length, end);
        // Split top-level commas (ignore commas inside parens)
        const parts = [];
        let buf = '', d = 0;
        for (const ch of inner) {
          if (ch === '(') d++;
          else if (ch === ')') d--;
          if (ch === ',' && d === 0) { parts.push(buf.trim()); buf = ''; continue; }
          buf += ch;
        }
        if (buf.trim()) parts.push(buf.trim());
        let angle = 180, si = 0;
        const angleMatch = parts[0]?.match(/(-?\d+(?:\.\d+)?)deg/);
        if (angleMatch && !parts[0].match(/#|rgb/i)) { angle = parseFloat(angleMatch[1]); si = 1; }
        const stops = [];
        for (let i = si; i < parts.length; i++) {
          const token = parts[i];
          const c = token.match(/(#[0-9a-f]{3,8}|rgba?\([^)]+\))/i);
          const p = token.match(/(\d+(?:\.\d+)?)%/);
          if (c) stops.push({ color: c[1], pos: p ? parseFloat(p[1]) / 100 : null });
        }
        if (stops.length && stops[0].pos == null) stops[0].pos = 0;
        if (stops.length > 1 && stops[stops.length - 1].pos == null) stops[stops.length - 1].pos = 1;
        // Distribute middle nulls
        for (let i = 1; i < stops.length - 1; i++) {
          if (stops[i].pos == null) stops[i].pos = i / (stops.length - 1);
        }
        return { type: 'linear', angle, stops, raw: bgImage };
      }

      function parseBorderRadius(br) {
        // may be "16px" or "16px 16px 16px 16px"
        const parts = br.split(' ').map(v => parseFloat(v) || 0);
        if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
        if (parts.length === 4) return parts;
        return [parts[0] || 0, parts[1] || 0, parts[2] || 0, parts[3] || 0];
      }

      function parseBoxShadow(bs) {
        if (!bs || bs === 'none') return null;
        // rgba(0, 0, 0, 0.08) 0px 4px 20px 0px
        const colorMatch = bs.match(/rgba?\([^)]+\)|#[0-9a-f]+/i);
        const rest = colorMatch ? bs.replace(colorMatch[0], '').trim() : bs;
        const nums = rest.match(/-?\d+(?:\.\d+)?px/g) || [];
        if (nums.length < 2) return null;
        return {
          color: colorMatch ? colorMatch[0] : 'rgba(0,0,0,0.2)',
          offsetX: parseFloat(nums[0]),
          offsetY: parseFloat(nums[1]),
          blur: parseFloat(nums[2] || '0'),
        };
      }

      function hasDirectText(node) {
        for (const c of node.childNodes) {
          if (c.nodeType === 3 && c.textContent.trim()) return true;
        }
        return false;
      }

      function extractRuns(el, parentStyle) {
        // Walk children; for each text node, create Range and measure line rects.
        // Returns an array of { lines: [{x,y,w,h, text, fontSize, weight, color, align}] }
        const out = [];
        for (const ch of el.childNodes) {
          if (ch.nodeType === 3) {
            const txt = ch.textContent;
            if (!txt || !txt.trim()) continue;
            const range = document.createRange();
            range.selectNodeContents(ch);
            const rects = range.getClientRects();
            for (const r of rects) {
              if (r.width < 0.5 || r.height < 0.5) continue;
              out.push({
                type: 'line',
                x: r.left - slideRect.left,
                y: r.top - slideRect.top,
                w: r.width,
                h: r.height,
                // Can't slice text per-rect easily; use fullText + approximate
                text: null, // Filled in post
                parentStyle,
              });
            }
          } else if (ch.nodeType === 1) {
            const tagc = (ch.tagName || '').toUpperCase();
            if (tagc === 'BR') {
              out.push({ type: 'br' });
            } else {
              const csc = window.getComputedStyle(ch);
              const mergedStyle = {
                fontSize: parseFloat(csc.fontSize),
                fontWeight: parseInt(csc.fontWeight) || parentStyle.fontWeight,
                color: csc.color,
                textAlign: csc.textAlign || parentStyle.textAlign,
                fontFamily: csc.fontFamily,
                italic: csc.fontStyle === 'italic',
                lineHeight: csc.lineHeight,
              };
              out.push(...extractRuns(ch, mergedStyle));
            }
          }
        }
        return out;
      }

      function isPseudo(el) {
        try {
          const before = window.getComputedStyle(el, '::before').content;
          return before && before !== 'none' && before !== 'normal' && before !== '""';
        } catch { return false; }
      }

      function walk(node) {
        if (node.nodeType !== 1) return;
        if (node === slideEl) {
          // Record slide root style
          const cs = window.getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          elements.push({
            order: order++,
            tag: 'SLIDE',
            bbox: { x: 0, y: 0, w: rect.width, h: rect.height },
            bg: {
              color: cs.backgroundColor,
              gradient: parseGradient(cs.backgroundImage),
            },
            borderTopWidth: parseFloat(cs.borderTopWidth) || 0,
            borderTopColor: cs.borderTopColor,
          });
          for (const c of node.children) walk(c);
          return;
        }

        const cs = window.getComputedStyle(node);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity || '1') === 0) return;

        const rect = node.getBoundingClientRect();
        if (rect.width < 0.5 || rect.height < 0.5) return;

        const tag = node.tagName.toUpperCase();

        // SVG roots → raster
        if (tag === 'SVG') {
          const elemId = `el${order++}`;
          elements.push({
            order: elements[elements.length - 1]?.order + 1 || order,
            tag: 'RASTER',
            subtype: 'svg',
            id: elemId,
            bbox: {
              x: rect.left - slideRect.left,
              y: rect.top - slideRect.top,
              w: rect.width,
              h: rect.height,
            },
          });
          assetQueue.push({ id: elemId, el: node, kind: 'svg' });
          return;
        }

        // IMG → use natural image data + object-fit computed rect
        if (tag === 'IMG') {
          const naturalW = node.naturalWidth || rect.width;
          const naturalH = node.naturalHeight || rect.height;
          const objFit = cs.objectFit || 'fill';
          let vx = rect.left, vy = rect.top, vw = rect.width, vh = rect.height;
          if (objFit === 'contain' && naturalW > 0 && naturalH > 0) {
            const aspect = naturalW / naturalH;
            const bboxAspect = rect.width / rect.height;
            if (bboxAspect > aspect) {
              vh = rect.height;
              vw = rect.height * aspect;
              vx = rect.left + (rect.width - vw) / 2;
            } else {
              vw = rect.width;
              vh = rect.width / aspect;
              vy = rect.top + (rect.height - vh) / 2;
            }
          }
          const elemId = `el${order++}`;
          elements.push({
            order: order,
            tag: 'RASTER',
            subtype: 'img',
            id: elemId,
            src: node.src,  // data URL or http URL
            bbox: {
              x: vx - slideRect.left,
              y: vy - slideRect.top,
              w: vw,
              h: vh,
            },
          });
          // Don't queue for screenshot — data is in src
          return;
        }

        // Transform / pseudo → raster fallback
        if (cs.transform && cs.transform !== 'none') {
          const elemId = `el${order++}`;
          elements.push({
            tag: 'RASTER', subtype: 'transform', id: elemId,
            bbox: { x: rect.left - slideRect.left, y: rect.top - slideRect.top, w: rect.width, h: rect.height },
          });
          assetQueue.push({ id: elemId, el: node, kind: 'transform' });
          return;
        }
        if (isPseudo(node)) {
          const elemId = `el${order++}`;
          elements.push({
            tag: 'RASTER', subtype: 'pseudo', id: elemId,
            bbox: { x: rect.left - slideRect.left, y: rect.top - slideRect.top, w: rect.width, h: rect.height },
          });
          assetQueue.push({ id: elemId, el: node, kind: 'pseudo' });
          return;
        }

        // Background / border / radius → emit as SHAPE
        const bgColor = cs.backgroundColor;
        const bgImage = cs.backgroundImage;
        const borderTop = parseFloat(cs.borderTopWidth) || 0;
        const borderRight = parseFloat(cs.borderRightWidth) || 0;
        const borderBottom = parseFloat(cs.borderBottomWidth) || 0;
        const borderLeft = parseFloat(cs.borderLeftWidth) || 0;
        const hasBorder = Math.max(borderTop, borderRight, borderBottom, borderLeft) > 0;
        const hasBg = bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent';
        const hasGradient = bgImage && bgImage !== 'none' && bgImage.includes('gradient');
        const bradius = parseBorderRadius(cs.borderTopLeftRadius + ' ' + cs.borderTopRightRadius + ' ' + cs.borderBottomRightRadius + ' ' + cs.borderBottomLeftRadius);
        const maxRadius = Math.max(...bradius);

        if (hasBg || hasGradient || hasBorder || maxRadius > 0) {
          elements.push({
            order: order++,
            tag: 'SHAPE',
            htmlTag: tag,
            bbox: {
              x: rect.left - slideRect.left,
              y: rect.top - slideRect.top,
              w: rect.width,
              h: rect.height,
            },
            bg: hasBg ? bgColor : null,
            gradient: hasGradient ? parseGradient(bgImage) : null,
            border: hasBorder ? {
              top: borderTop, right: borderRight, bottom: borderBottom, left: borderLeft,
              color: cs.borderTopColor,
              style: cs.borderTopStyle,
            } : null,
            borderRadius: bradius,
            boxShadow: parseBoxShadow(cs.boxShadow),
            opacity: parseFloat(cs.opacity || '1'),
          });
        }

        // Text: measured per Range line
        // ------------------------
        // Measure visible text lines from a text node. Returns {text, x, y, w, h}[]
        // where text is what's actually rendered on that visual line (whitespace-
        // collapsed, leading/trailing trimmed). The bbox exactly matches the
        // rendered glyphs because we use a Range spanning ONLY the visible chars.
        function measureTextLines(textNode, rawTxt, normalizedTxt) {
          const results = [];
          // Use full-range rects to find visual lines, then for each line,
          // binary-search the char offsets in rawTxt that produced that line.
          const fullRange = document.createRange();
          fullRange.selectNodeContents(textNode);
          const lineRects = Array.from(fullRange.getClientRects());
          if (lineRects.length === 0) return results;
          // For each line rect, find the substring that falls inside it.
          // Approach: walk chars, measure each char's Range, check if its rect
          // overlaps this line rect vertically (y center match). Collect chars
          // belonging to this line. This is O(n*m) but texts are short.
          const len = rawTxt.length;
          // Precompute per-char center Y
          const charInfo = new Array(len);
          for (let i = 0; i < len; i++) {
            const rr = document.createRange();
            rr.setStart(textNode, i);
            rr.setEnd(textNode, i + 1);
            const rs = rr.getClientRects();
            if (rs.length === 0) { charInfo[i] = null; continue; }
            const r = rs[0];
            charInfo[i] = {
              cy: r.top + r.height / 2,
              x: r.left, y: r.top, w: r.width, h: r.height,
              char: rawTxt[i],
            };
          }
          for (const lr of lineRects) {
            const cy = lr.top + lr.height / 2;
            const lineChars = [];
            for (let i = 0; i < len; i++) {
              const ci = charInfo[i];
              if (!ci) continue;
              if (Math.abs(ci.cy - cy) < Math.max(2, lr.height * 0.4)) {
                lineChars.push({ i, ...ci });
              }
            }
            if (lineChars.length === 0) continue;
            // Sort by x
            lineChars.sort((a, b) => a.x - b.x);
            // Trim leading/trailing whitespace chars
            let start = 0, end = lineChars.length;
            while (start < end && /\s/.test(lineChars[start].char)) start++;
            while (end > start && /\s/.test(lineChars[end - 1].char)) end--;
            if (start >= end) continue;
            const trimmed = lineChars.slice(start, end);
            // Build text, collapsing internal whitespace runs to single space
            let text = '';
            let prevSpace = false;
            for (const c of trimmed) {
              const isSpace = /\s/.test(c.char);
              if (isSpace) {
                if (!prevSpace) text += ' ';
                prevSpace = true;
              } else {
                text += c.char;
                prevSpace = false;
              }
            }
            const x0 = trimmed[0].x;
            const y0 = Math.min(...trimmed.map(c => c.y));
            const x1 = trimmed[trimmed.length - 1].x + trimmed[trimmed.length - 1].w;
            const y1 = Math.max(...trimmed.map(c => c.y + c.h));
            results.push({ text, x: x0, y: y0, w: x1 - x0, h: y1 - y0 });
          }
          return results;
        }

        if (hasDirectText(node) || Array.from(node.childNodes).every(c => c.nodeType === 3 || (c.nodeType === 1 && ['SPAN', 'STRONG', 'EM', 'B', 'I', 'BR', 'A'].includes(c.tagName)))) {
          // Collect text lines with runs
          const parentStyle = {
            fontSize: parseFloat(cs.fontSize),
            fontWeight: parseInt(cs.fontWeight) || 400,
            color: cs.color,
            textAlign: cs.textAlign,
            fontFamily: cs.fontFamily,
            italic: cs.fontStyle === 'italic',
            lineHeight: cs.lineHeight,
          };
          // Flatten runs: walk descendants, for each text node, get all Range rects.
          // Then group runs by line (by y-coord) and emit textbox per line.
          const textRuns = [];
          function collectRuns(el, style) {
            for (const ch of el.childNodes) {
              if (ch.nodeType === 3) {
                const rawTxt = ch.textContent;
                if (!rawTxt || !rawTxt.trim()) continue;
                // CSS 'white-space: normal' collapses runs of whitespace to a single
                // space, and trims leading/trailing whitespace at block boundaries.
                // Normalize to match visual rendering.
                const normalized = rawTxt.replace(/\s+/g, ' ').trim();
                if (!normalized) continue;
                // Per-line measurement via sub-Range: walk character by character,
                // build a Range that exactly matches each visible line. This produces
                // accurate bbox AND correctly matches the normalized text.
                const lines = measureTextLines(ch, rawTxt, normalized);
                for (const line of lines) {
                  if (!line.text) continue;
                  textRuns.push({
                    text: line.text,
                    x: line.x - slideRect.left,
                    y: line.y - slideRect.top,
                    w: line.w,
                    h: line.h,
                    ...style,
                  });
                }
              } else if (ch.nodeType === 1) {
                if (ch.tagName === 'BR') continue;
                const csc = window.getComputedStyle(ch);
                const merged = {
                  fontSize: parseFloat(csc.fontSize),
                  fontWeight: parseInt(csc.fontWeight) || style.fontWeight,
                  color: csc.color,
                  textAlign: csc.textAlign || style.textAlign,
                  fontFamily: csc.fontFamily,
                  italic: csc.fontStyle === 'italic',
                  lineHeight: csc.lineHeight,
                };
                collectRuns(ch, merged);
              }
            }
          }
          collectRuns(node, parentStyle);
          // Only emit if there are any runs (avoids double-emission on wrapper divs)
          // Check if this is the closest container (no descendant already emits text)
          if (textRuns.length > 0 && !isWrapperOnly(node)) {
            elements.push({
              order: order++,
              tag: 'TEXT',
              containerBbox: {
                x: rect.left - slideRect.left,
                y: rect.top - slideRect.top,
                w: rect.width,
                h: rect.height,
              },
              runs: textRuns,
            });
            return; // stop descent
          }
        }

        for (const c of node.children) walk(c);
      }

      function isWrapperOnly(el) {
        // True if this element contains only child elements (no direct text)
        // so child elements should handle text emission individually
        for (const c of el.childNodes) {
          if (c.nodeType === 3 && c.textContent.trim()) return false;
        }
        // Has only element children → not a text leaf
        return el.children.length > 0 && !hasDirectText(el);
      }

      walk(slideEl);
      return { elements, assetIds: assetQueue.map(a => ({ id: a.id, kind: a.kind })) };
    });

    // --- 2. Rasterize queued elements ---
    const assetHandles = await slide.evaluateHandle(() => {
      return window.__pendingRasterEls || [];
    });
    // Actually simpler: re-query each asset via locator inside the slide
    // We need a selector for each. Instead, iterate DOM order again and use bbox-based capture.
    // Skip complex locator; take each element screenshot by walking in order and
    // matching with asset list.

    const assetMeta = [];
    // Use a fresh evaluation: tag each asset element with a data attribute so we can locate it
    const assetCount = await slide.evaluate((slideEl) => {
      // Re-walk: mark elements in same order as earlier
      let counter = 0;
      function mark(node) {
        if (node.nodeType !== 1) return;
        if (node === slideEl) { for (const c of node.children) mark(c); return; }
        const cs = window.getComputedStyle(node);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity || '1') === 0) return;
        const rect = node.getBoundingClientRect();
        if (rect.width < 0.5 || rect.height < 0.5) return;
        const tag = node.tagName.toUpperCase();
        if (tag === 'SVG' || tag === 'IMG') {
          node.setAttribute('data-ppt-asset', (tag === 'IMG' ? 'img-' : 'svg-') + counter++);
          return;
        }
        if (cs.transform && cs.transform !== 'none') {
          node.setAttribute('data-ppt-asset', 'xfm-' + counter++);
          return;
        }
        try {
          const before = window.getComputedStyle(node, '::before').content;
          if (before && before !== 'none' && before !== 'normal' && before !== '""') {
            node.setAttribute('data-ppt-asset', 'pse-' + counter++);
            return;
          }
        } catch {}
        for (const c of node.children) mark(c);
      }
      mark(slideEl);
      return counter;
    });

    if (assetCount > 0) {
      // Get all marked elements in order
      const markedElements = await slide.locator('[data-ppt-asset]').all();
      for (let k = 0; k < markedElements.length; k++) {
        const me = markedElements[k];
        const tag = await me.getAttribute('data-ppt-asset');
        const pngName = `${prefix}_s${String(i + 1).padStart(2, '0')}_${tag}.png`;
        const pngPath = path.join(ASSETS_DIR, pngName);
        try {
          // ISOLATION: hide every other visible element in the slide
          // so only this target (and its descendants) is visible.
          await me.evaluate((targetEl) => {
            const keep = new Set([targetEl]);
            // Include all descendants of target
            targetEl.querySelectorAll('*').forEach(e => keep.add(e));
            // Include all ancestors (so target is reachable in DOM)
            let cur = targetEl.parentElement;
            while (cur) { keep.add(cur); cur = cur.parentElement; }
            // Hide everything else in the whole document
            const all = document.querySelectorAll('body *');
            const hidden = [];
            for (const el of all) {
              if (!keep.has(el)) {
                hidden.push([el, el.style.visibility]);
                el.style.setProperty('visibility', 'hidden', 'important');
              }
            }
            window.__ppthidden = hidden;
            // Also blank out the body/html backgrounds
            document.documentElement.style.background = 'transparent';
            document.body.style.background = 'transparent';
          });
          await me.screenshot({ path: pngPath, omitBackground: true });
          // Restore
          await me.evaluate(() => {
            const hidden = window.__ppthidden || [];
            for (const [el, orig] of hidden) {
              if (orig) el.style.visibility = orig;
              else el.style.removeProperty('visibility');
            }
            delete window.__ppthidden;
            document.documentElement.style.background = '';
            document.body.style.background = '';
          });
          assetMeta.push({ tag, png: pngName });
        } catch (e) {
          console.log(`  WARN: could not screenshot ${tag}: ${e.message}`);
        }
      }
      // Remove markers
      await slide.evaluate(() => {
        document.querySelectorAll('[data-ppt-asset]').forEach(e => e.removeAttribute('data-ppt-asset'));
      });
    }

    slides.push({
      index: i + 1,
      elements: data.elements,
      assets: assetMeta,
    });

    if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${slideCount}`);
  }

  await browser.close();
  return slides;
}

// ====== Run ======
const tasks = [
  { html: '/Users/suni/eduzip/public/lectures/kkakdugi-marketing-day1/index.html', prefix: 'day1' },
  { html: '/Users/suni/eduzip/public/lectures/kkakdugi-marketing-day2/index.html', prefix: 'day2' },
];

for (const task of tasks) {
  console.time(task.prefix);
  const slides = await captureFile(task.html, task.prefix);
  fs.writeFileSync(
    path.join(OUT_DIR, `${task.prefix}.json`),
    JSON.stringify(slides, null, 2)
  );
  console.timeEnd(task.prefix);
  console.log(`  ${task.prefix}: ${slides.length} slides, ${slides.reduce((s, d) => s + d.elements.length, 0)} elements, ${slides.reduce((s, d) => s + d.assets.length, 0)} assets`);
}
console.log('DONE');
