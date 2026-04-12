/**
 * day3 교안용 스크린샷 캡처 (v2 — 로딩 완료 대기 + 도구 결과 캡처)
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

if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

async function login(page) {
  console.log('[로그인] 시도...');
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  await page.waitForTimeout(2000);
  await page.evaluate(() => localStorage.setItem('i18nextLng', 'ko'));
  // 이미 로그인 상태인지 확인
  if (!page.url().includes('/login')) {
    console.log('[로그인] 이미 로그인됨:', page.url());
    return true;
  }
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.locator('button[type="submit"]').click();
  // 로그인 완료 대기
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(500);
    if (!page.url().includes('/login')) {
      console.log('[로그인] 성공:', page.url());
      await page.waitForTimeout(3000); // Supabase 세션 안정화 대기
      return true;
    }
  }
  console.log('[로그인] 실패');
  return false;
}

/** 로딩 스피너 사라질 때까지 대기 (animate-spin 클래스 포함) */
async function waitForContent(page, timeout = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const spinning = await page.evaluate(() => {
      return document.querySelectorAll('.animate-spin, [class*="animate-spin"]').length;
    });
    if (spinning === 0) {
      const bodyLen = await page.evaluate(() => document.body.innerText.trim().length);
      if (bodyLen > 50) return true;
    }
    await page.waitForTimeout(500);
  }
  console.log('  [경고] 로딩 대기 타임아웃');
  return false;
}

async function snap(page, name, urlPath, opts = {}) {
  const { fullPage = false, waitSel, clickSel, scroll } = opts;
  console.log(`[${name}] ${urlPath || '(현재 페이지)'}`);

  if (urlPath) {
    await page.goto(`${BASE}${urlPath}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
  }

  await waitForContent(page);
  await page.waitForTimeout(1500);

  if (clickSel) {
    try {
      await page.locator(clickSel).first().click();
      await page.waitForTimeout(1500);
    } catch(e) { console.log('  click 실패:', e.message); }
  }

  if (scroll) {
    await page.evaluate((px) => window.scrollBy(0, px), scroll);
    await page.waitForTimeout(800);
  }

  if (waitSel) {
    try { await page.waitForSelector(waitSel, { timeout: 8000 }); } catch(e) {}
  }

  await page.waitForTimeout(500);
  const fp = path.join(DIR, `${name}.png`);
  await page.screenshot({ path: fp, fullPage });
  const size = fs.statSync(fp).size;
  console.log(`  저장: ${name}.png (${Math.round(size/1024)}KB)`);
  return size > 15000; // 15KB 이상이면 의미 있는 캡처
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: 'ko-KR',
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  const ok = await login(page);
  if (!ok) { await browser.close(); return; }

  // 1. 마케팅 허브
  await snap(page, '01_hub', '/marketing/hub');

  // 2. 등교 탭 (학생증 + 도장판)
  await snap(page, '02_attendance_top', '/marketing/school/attendance');
  await snap(page, '03_attendance_stamps', null, { scroll: 400 });

  // 3. 시간표 탭
  await snap(page, '04_curriculum', '/marketing/school/curriculum');
  // 아코디언 열기 — 1교시 클릭
  await snap(page, '05_curriculum_open', null, { clickSel: '[class*="accordion"] button, [class*="Accordion"] button, button:has-text("1교시"), button:has-text("기초")' });

  // 4. 도구함 탭
  await snap(page, '06_lab', '/marketing/school/lab');

  // 5. 적성 검사기
  await page.goto(`${BASE}/marketing/school/tools/aptitude-test`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  await waitForContent(page);
  await page.waitForTimeout(2000);
  await snap(page, '07_aptitude_intro', null);

  // 적성 검사 시작 및 응답
  try {
    const startBtn = page.locator('button').filter({ hasText: /시작|검사|새로/ }).first();
    if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await startBtn.click();
      await page.waitForTimeout(1500);
    }
    // 질문 자동 응답
    for (let q = 0; q < 20; q++) {
      const opts = page.locator('button').filter({ hasText: /.{4,}/ });
      const cnt = await opts.count();
      if (cnt >= 2) {
        await opts.nth(q % 2).click();
        await page.waitForTimeout(600);
      } else break;
    }
    // 결과 대기
    console.log('  적성검사 결과 대기 (최대 40초)...');
    for (let i = 0; i < 40; i++) {
      await page.waitForTimeout(1000);
      const text = await page.locator('body').innerText();
      if (text.includes('CEO') || text.includes('PM형') || text.includes('CPO') || text.includes('결과')) break;
    }
    await page.waitForTimeout(2000);
    await snap(page, '08_aptitude_result', null, { fullPage: true });
  } catch(e) {
    console.log('  적성검사 오류:', e.message);
    await snap(page, '08_aptitude_result', null);
  }

  // 6. 시장 탐색기
  await page.goto(`${BASE}/marketing/school/tools/market-scanner`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  await waitForContent(page);
  await page.waitForTimeout(2000);
  await snap(page, '09_scanner_input', null);

  // 입력 + 분석
  try {
    const inputs = page.locator('input[type="text"], input:not([type])');
    if (await inputs.count() >= 1) await inputs.first().fill('수제 쿠키');

    const selects = page.locator('select');
    const sc = await selects.count();
    if (sc >= 1) await selects.nth(0).selectOption({ index: 1 });
    if (sc >= 2) await selects.nth(1).selectOption({ index: 2 });

    await page.waitForTimeout(500);

    const analyzeBtn = page.locator('button').filter({ hasText: /분석|시작|스캔|검색/ }).first();
    if (await analyzeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await analyzeBtn.click();
      console.log('  시장분석 대기 (최대 60초)...');
      await page.waitForTimeout(60000);
      await snap(page, '10_scanner_result', null, { fullPage: true });
    }
  } catch(e) {
    console.log('  시장탐색기 오류:', e.message);
    await snap(page, '10_scanner_result', null);
  }

  // 7. 브랜드 만들기 (엣지메이커)
  await page.goto(`${BASE}/marketing/school/tools/edge-maker`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  await waitForContent(page);
  await page.waitForTimeout(2000);
  await snap(page, '11_edge_input', null);

  try {
    const textareas = page.locator('textarea');
    const ta_count = await textareas.count();
    if (ta_count >= 1) await textareas.nth(0).fill('건강한 재료로 만든 수제 쿠키. 당일 배송.');

    const inputs = page.locator('input[type="text"], input:not([type])');
    const ic = await inputs.count();
    if (ic >= 1) await inputs.nth(0).fill('정성 가득 수제 쿠키');

    const makeBtn = page.locator('button').filter({ hasText: /만들기|생성|시작|분석/ }).first();
    if (await makeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await makeBtn.click();
      console.log('  브랜드 생성 대기 (최대 60초)...');
      await page.waitForTimeout(60000);
      await snap(page, '12_edge_result', null, { fullPage: true });
    }
  } catch(e) {
    console.log('  브랜드 만들기 오류:', e.message);
    await snap(page, '12_edge_result', null);
  }

  // 8. 콘텐츠 메이커 (바이럴카드)
  await page.goto(`${BASE}/marketing/school/tools/viral-card-maker`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  await waitForContent(page);
  await page.waitForTimeout(2000);
  await snap(page, '13_viral_input', null);

  try {
    const inputs = page.locator('input[type="text"], input:not([type])');
    const ic = await inputs.count();
    if (ic >= 1) await inputs.nth(0).fill('수제 쿠키');
    if (ic >= 2) await inputs.nth(1).fill('20대 여성, 디저트 매니아');
    if (ic >= 3) await inputs.nth(2).fill('100% 수작업, 무첨가, 당일 배송');

    const toneBtn = page.locator('button, label').filter({ hasText: /감성|따뜻/ }).first();
    if (await toneBtn.isVisible({ timeout: 2000 }).catch(() => false)) await toneBtn.click();

    const makeBtn = page.locator('button').filter({ hasText: /만들기|생성|시작/ }).first();
    if (await makeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await makeBtn.click();
      console.log('  콘텐츠 생성 대기 (최대 60초)...');
      await page.waitForTimeout(60000);
      await snap(page, '14_viral_result', null, { fullPage: true });
    }
  } catch(e) {
    console.log('  콘텐츠 메이커 오류:', e.message);
    await snap(page, '14_viral_result', null);
  }

  // 9. 세일즈 라이터 (퍼펙트플래너)
  await page.goto(`${BASE}/marketing/school/tools/perfect-planner`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  await waitForContent(page);
  await page.waitForTimeout(2000);
  await snap(page, '15_planner_input', null);

  try {
    const inputs = page.locator('input[type="text"], input:not([type])');
    const ic = await inputs.count();
    if (ic >= 1) await inputs.nth(0).fill('수제 쿠키');
    if (ic >= 2) await inputs.nth(1).fill('직장인, 선물용');
    if (ic >= 3) await inputs.nth(2).fill('무첨가, 당일 배송');

    const makeBtn = page.locator('button').filter({ hasText: /만들기|생성|시작/ }).first();
    if (await makeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await makeBtn.click();
      console.log('  세일즈 라이터 대기 (최대 60초)...');
      await page.waitForTimeout(60000);
      await snap(page, '16_planner_result', null, { fullPage: true });
    }
  } catch(e) {
    console.log('  세일즈 라이터 오류:', e.message);
    await snap(page, '16_planner_result', null);
  }

  // 10. ROAS 예측기
  await page.goto(`${BASE}/marketing/school/tools/roas-simulator`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  await waitForContent(page);
  await page.waitForTimeout(2000);
  await snap(page, '17_roas_input', null);

  try {
    const inputs = page.locator('input[type="number"], input[type="text"], input:not([type])');
    const ic = await inputs.count();
    if (ic >= 1) await inputs.nth(0).fill('500000');
    if (ic >= 2) await inputs.nth(1).fill('2000000');

    const calcBtn = page.locator('button').filter({ hasText: /계산|분석|진단|시작|예측/ }).first();
    if (await calcBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await calcBtn.click();
      console.log('  ROAS 계산 대기 (최대 30초)...');
      await page.waitForTimeout(30000);
      await snap(page, '18_roas_result', null, { fullPage: true });
    }
  } catch(e) {
    console.log('  ROAS 오류:', e.message);
    await snap(page, '18_roas_result', null);
  }

  // 11. 졸업 과제
  await snap(page, '19_graduation_project', '/marketing/school/graduation-project');

  // 12. 프로필 (졸업 후)
  await snap(page, '20_profile', '/profile');

  await browser.close();

  // 결과 요약
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.png'));
  console.log(`\n========== 완료 ==========`);
  console.log(`총 ${files.length}장:`);
  files.forEach(f => {
    const sz = fs.statSync(path.join(DIR, f)).size;
    const ok = sz > 15000 ? '✅' : '⚠️ 작음';
    console.log(`  ${ok} ${f} (${Math.round(sz/1024)}KB)`);
  });
}

main().catch(e => { console.error('치명적 오류:', e); process.exit(1); });
