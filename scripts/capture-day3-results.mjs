/**
 * day3 교안용 — 도구 결과 캡처 (예시 데이터 입력 → AI 생성 → 결과 캡처)
 */
import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, '..', 'screenshots-day3');
const BASE = 'https://kkakdugischool.vercel.app';
const STATE_FILE = path.join(__dirname, '.auth-state.json');

if (!fs.existsSync(STATE_FILE)) {
  console.error('.auth-state.json 없음 — capture-day3.mjs 먼저 실행하세요');
  process.exit(1);
}

async function snap(page, name, fullPage = false) {
  const fp = path.join(DIR, `${name}.png`);
  await page.screenshot({ path: fp, fullPage });
  const size = fs.statSync(fp).size;
  console.log(`  ${size > 15000 ? '✅' : '⚠️'} ${name}.png (${Math.round(size/1024)}KB)`);
}

async function waitLoaded(page, maxMs = 25000) {
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    const s = await page.evaluate(() => ({
      sp: document.querySelectorAll('.animate-spin').length,
      len: document.body.innerText.trim().length,
    }));
    if (s.sp === 0 && s.len > 80) return true;
    await page.waitForTimeout(800);
  }
  return false;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, locale: 'ko-KR', deviceScaleFactor: 2,
    storageState: STATE_FILE,
  });

  // ── 시장 탐색기 결과 ──
  console.log('\n=== 시장 탐색기 (입력→결과) ===');
  let pg = await ctx.newPage();
  await pg.goto(`${BASE}/marketing/school/tools/market-scanner`, { waitUntil: 'domcontentloaded' });
  await pg.waitForTimeout(5000);
  await waitLoaded(pg);

  try {
    // 입력
    const inputs = pg.locator('input[type="text"], input:not([type])');
    const ic = await inputs.count();
    if (ic >= 1) await inputs.first().fill('수제 쿠키');

    const selects = pg.locator('select');
    const sc = await selects.count();
    if (sc >= 1) await selects.nth(0).selectOption({ index: 1 });
    if (sc >= 2) await selects.nth(1).selectOption({ index: 2 });

    await pg.waitForTimeout(500);
    await snap(pg, '07_scanner_input');

    const btn = pg.locator('button').filter({ hasText: /분석|시작|스캔|검색/ }).first();
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click();
      console.log('  AI 분석 대기 (60초)...');
      await pg.waitForTimeout(60000);
      await snap(pg, '07b_scanner_result', true);
    }
  } catch(e) { console.log('  오류:', e.message); }
  await pg.close();

  // ── 브랜드 만들기 결과 ──
  console.log('\n=== 브랜드 만들기 (입력→결과) ===');
  pg = await ctx.newPage();
  await pg.goto(`${BASE}/marketing/school/tools/edge-maker`, { waitUntil: 'domcontentloaded' });
  await pg.waitForTimeout(5000);
  await waitLoaded(pg);

  try {
    const textareas = pg.locator('textarea');
    if (await textareas.count() >= 1) await textareas.nth(0).fill('건강한 재료, 수작업, 당일 배송이 강점인 수제 쿠키 브랜드');

    const inputs = pg.locator('input[type="text"], input:not([type])');
    if (await inputs.count() >= 1) await inputs.nth(0).fill('수제 쿠키');

    await pg.waitForTimeout(500);
    await snap(pg, '08_edge_input');

    const btn = pg.locator('button').filter({ hasText: /만들기|생성|시작|분석/ }).first();
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click();
      console.log('  AI 생성 대기 (60초)...');
      await pg.waitForTimeout(60000);
      await snap(pg, '08b_edge_result', true);
    }
  } catch(e) { console.log('  오류:', e.message); }
  await pg.close();

  // ── 콘텐츠 메이커 결과 ──
  console.log('\n=== 콘텐츠 메이커 (입력→결과) ===');
  pg = await ctx.newPage();
  await pg.goto(`${BASE}/marketing/school/tools/viral-card-maker`, { waitUntil: 'domcontentloaded' });
  await pg.waitForTimeout(5000);
  await waitLoaded(pg);

  try {
    const inputs = pg.locator('input[type="text"], input:not([type])');
    const ic = await inputs.count();
    if (ic >= 1) await inputs.nth(0).fill('수제 쿠키');
    if (ic >= 2) await inputs.nth(1).fill('20대 여성 디저트 매니아');
    if (ic >= 3) await inputs.nth(2).fill('100% 수작업 무첨가 당일배송');

    const toneBtn = pg.locator('button, label').filter({ hasText: /감성|따뜻/ }).first();
    if (await toneBtn.isVisible({ timeout: 2000 }).catch(() => false)) await toneBtn.click();

    await pg.waitForTimeout(500);
    await snap(pg, '09_viral_input');

    const btn = pg.locator('button').filter({ hasText: /만들기|생성|시작/ }).first();
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click();
      console.log('  AI 생성 대기 (60초)...');
      await pg.waitForTimeout(60000);
      await snap(pg, '09b_viral_result', true);
    }
  } catch(e) { console.log('  오류:', e.message); }
  await pg.close();

  // ── 세일즈 라이터 결과 ──
  console.log('\n=== 세일즈 라이터 (입력→결과) ===');
  pg = await ctx.newPage();
  await pg.goto(`${BASE}/marketing/school/tools/perfect-planner`, { waitUntil: 'domcontentloaded' });
  await pg.waitForTimeout(5000);
  await waitLoaded(pg);

  try {
    const inputs = pg.locator('input[type="text"], input:not([type])');
    const ic = await inputs.count();
    if (ic >= 1) await inputs.nth(0).fill('수제 쿠키');
    if (ic >= 2) await inputs.nth(1).fill('직장인 선물용');
    if (ic >= 3) await inputs.nth(2).fill('무첨가 수작업 당일배송');

    await pg.waitForTimeout(500);
    await snap(pg, '10_planner_input');

    const btn = pg.locator('button').filter({ hasText: /만들기|생성|시작/ }).first();
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click();
      console.log('  AI 생성 대기 (60초)...');
      await pg.waitForTimeout(60000);
      await snap(pg, '10b_planner_result', true);
    }
  } catch(e) { console.log('  오류:', e.message); }
  await pg.close();

  // ── ROAS 예측기 결과 ──
  console.log('\n=== ROAS 예측기 (입력→결과) ===');
  pg = await ctx.newPage();
  await pg.goto(`${BASE}/marketing/school/tools/roas-simulator`, { waitUntil: 'domcontentloaded' });
  await pg.waitForTimeout(5000);
  await waitLoaded(pg);

  try {
    const inputs = pg.locator('input');
    const ic = await inputs.count();
    for (let i = 0; i < ic; i++) {
      const inp = inputs.nth(i);
      const ph = await inp.getAttribute('placeholder') || '';
      const type = await inp.getAttribute('type') || 'text';
      if (type === 'number' || type === 'text' || type === '') {
        if (ph.includes('광고') || ph.includes('비용') || i === 0) await inp.fill('500000');
        else if (ph.includes('매출') || ph.includes('수익') || i === 1) await inp.fill('2000000');
      }
    }

    await pg.waitForTimeout(500);
    await snap(pg, '11_roas_input');

    const btn = pg.locator('button').filter({ hasText: /계산|분석|진단|예측|시작/ }).first();
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click();
      console.log('  ROAS 계산 대기 (30초)...');
      await pg.waitForTimeout(30000);
      await snap(pg, '11b_roas_result', true);
    }
  } catch(e) { console.log('  오류:', e.message); }
  await pg.close();

  await browser.close();

  // 결과 요약
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.png'));
  console.log(`\n========== 완료: ${files.length}장 ==========`);
  files.forEach(f => {
    const sz = fs.statSync(path.join(DIR, f)).size;
    console.log(`  ${sz > 15000 ? '✅' : '⚠️'} ${f} (${Math.round(sz/1024)}KB)`);
  });
}

main().catch(e => { console.error(e); process.exit(1); });
