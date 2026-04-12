/**
 * day3 교안용 스크린샷 캡처 (v4 — storageState로 세션 유지)
 */
import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, '..', 'screenshots-day3');
const BASE = 'https://kkakdugischool.vercel.app';
const EMAIL = process.argv[2] || 'tndls7529@naver.com';
const PASSWORD = process.argv[3] || 'qwer1234!';
const STATE_FILE = path.join(__dirname, '.auth-state.json');

if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

async function snap(page, name) {
  await page.waitForTimeout(500);
  const fp = path.join(DIR, `${name}.png`);
  await page.screenshot({ path: fp, fullPage: false });
  const size = fs.statSync(fp).size;
  const ok = size > 15000 ? '✅' : '⚠️';
  console.log(`  ${ok} ${name}.png (${Math.round(size/1024)}KB)`);
  return size > 15000;
}

async function waitLoaded(page, maxMs = 25000) {
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    const spinning = await page.evaluate(() =>
      document.querySelectorAll('.animate-spin, [class*="animate-spin"]').length
    );
    const len = await page.evaluate(() => document.body.innerText.trim().length);
    if (spinning === 0 && len > 80) return true;
    await page.waitForTimeout(800);
  }
  console.log('  ⏱ 로딩 대기 초과');
  return false;
}

async function main() {
  // ── Step 1: 로그인하고 세션 저장 ──
  console.log('=== Step 1: 로그인 & 세션 저장 ===');
  const browser1 = await chromium.launch({ headless: true });
  const ctx1 = await browser1.newContext({
    viewport: { width: 390, height: 844 }, locale: 'ko-KR', deviceScaleFactor: 2,
  });
  const p1 = await ctx1.newPage();
  await p1.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await p1.waitForTimeout(3000);
  await p1.evaluate(() => localStorage.setItem('i18nextLng', 'ko'));

  if (p1.url().includes('/login')) {
    await p1.locator('input[type="email"]').fill(EMAIL);
    await p1.locator('input[type="password"]').fill(PASSWORD);
    await p1.locator('button[type="submit"]').click();
    for (let i = 0; i < 30; i++) {
      await p1.waitForTimeout(500);
      if (!p1.url().includes('/login')) break;
    }
  }
  console.log('로그인 완료:', p1.url());
  await p1.waitForTimeout(3000);

  // 세션 저장
  await ctx1.storageState({ path: STATE_FILE });
  console.log('세션 저장 완료');
  await browser1.close();

  // ── Step 2: 세션 복원하여 캡처 ──
  console.log('\n=== Step 2: 캡처 시작 ===');
  const browser2 = await chromium.launch({ headless: true });
  const ctx2 = await browser2.newContext({
    viewport: { width: 390, height: 844 }, locale: 'ko-KR', deviceScaleFactor: 2,
    storageState: STATE_FILE,
  });

  async function openPage(urlPath) {
    const page = await ctx2.newPage();
    await page.goto(`${BASE}${urlPath}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    await waitLoaded(page);
    await page.waitForTimeout(1000);
    return page;
  }

  // 1. 마케팅 허브
  console.log('\n[허브]');
  let pg = await openPage('/marketing/hub');
  await snap(pg, '01_hub');
  await pg.close();

  // 2. 등교 탭
  console.log('\n[등교]');
  pg = await openPage('/marketing/school/attendance');
  await snap(pg, '02_attendance');
  await pg.evaluate(() => window.scrollBy(0, 500));
  await pg.waitForTimeout(1000);
  await snap(pg, '03_stamps');
  await pg.close();

  // 3. 시간표 탭
  console.log('\n[시간표]');
  pg = await openPage('/marketing/school/curriculum');
  await snap(pg, '04_curriculum');
  await pg.close();

  // 4. 도구함 탭
  console.log('\n[도구함]');
  pg = await openPage('/marketing/school/lab');
  await snap(pg, '05_lab');
  await pg.close();

  // 5. 적성 검사기
  console.log('\n[적성 검사기]');
  pg = await openPage('/marketing/school/tools/aptitude-test');
  await snap(pg, '06_aptitude');
  await pg.close();

  // 6. 시장 탐색기
  console.log('\n[시장 탐색기]');
  pg = await openPage('/marketing/school/tools/market-scanner');
  await snap(pg, '07_scanner');
  await pg.close();

  // 7. 브랜드 만들기
  console.log('\n[브랜드 만들기]');
  pg = await openPage('/marketing/school/tools/edge-maker');
  await snap(pg, '08_edge');
  await pg.close();

  // 8. 콘텐츠 메이커
  console.log('\n[콘텐츠 메이커]');
  pg = await openPage('/marketing/school/tools/viral-card-maker');
  await snap(pg, '09_viral');
  await pg.close();

  // 9. 세일즈 라이터
  console.log('\n[세일즈 라이터]');
  pg = await openPage('/marketing/school/tools/perfect-planner');
  await snap(pg, '10_planner');
  await pg.close();

  // 10. ROAS 예측기
  console.log('\n[ROAS 예측기]');
  pg = await openPage('/marketing/school/tools/roas-simulator');
  await snap(pg, '11_roas');
  await pg.close();

  // 11. 졸업 과제
  console.log('\n[졸업과제]');
  pg = await openPage('/marketing/school/graduation-project');
  await snap(pg, '12_graduation');
  await pg.close();

  // 12. 프로필
  console.log('\n[프로필]');
  pg = await openPage('/profile');
  await snap(pg, '13_profile');
  await pg.close();

  await browser2.close();

  // 결과
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.png'));
  console.log(`\n========== 완료: ${files.length}장 ==========`);
  files.forEach(f => {
    const sz = fs.statSync(path.join(DIR, f)).size;
    console.log(`  ${sz > 15000 ? '✅' : '⚠️'} ${f} (${Math.round(sz/1024)}KB)`);
  });
}

main().catch(e => { console.error(e); process.exit(1); });
