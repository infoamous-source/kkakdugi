/**
 * 깍두기학교 스크린샷 자동 캡처 스크립트 (v3 - 오류 수정판)
 *
 * 수정 사항:
 *   1. 언어를 한국어(ko)로 강제 설정
 *   2. 로그인 성공 여부 검증 + 세션 유지 확인 + 자동 재로그인
 *   3. 각 캡처 후 로그인 페이지가 아닌지 자체 점검, 실패 시 재시도
 *
 * 사용법:
 *   npm install -D @playwright/test
 *   npx playwright install chromium
 *   node scripts/capture-screenshots.mjs [이메일] [비밀번호]
 */

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
const BASE_URL = 'https://kkakdugischool.vercel.app';

const EMAIL = process.argv[2] || 'tndls7529@naver.com';
const PASSWORD = process.argv[3] || 'qwer1234';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// ─── 유틸리티 ───

/** 현재 페이지가 로그인 페이지인지 확인 */
async function isOnLoginPage(page) {
  try {
    const url = page.url();
    if (url.includes('/login')) return true;
    const pwField = await page.locator('input[type="password"]').count();
    return pwField > 0;
  } catch {
    return false;
  }
}

/** 로그인 수행 및 성공 검증 */
async function login(page) {
  console.log('  [로그인] 로그인 시도 중...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  // 한국어 설정 (localStorage에 주입)
  await page.evaluate(() => {
    localStorage.setItem('i18nextLng', 'ko');
  });

  const emailInput = page.locator('input[type="email"]');
  await emailInput.fill(EMAIL);

  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.fill(PASSWORD);

  const loginButton = page.locator('button[type="submit"]');
  await loginButton.click();

  // 로그인 완료 대기 - URL이 /login이 아닌 곳으로 이동할 때까지
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(500);
    const url = page.url();
    if (!url.includes('/login')) {
      console.log(`  [로그인] 성공! 현재 URL: ${url}`);
      // 추가 대기 (환영 배너 등)
      await page.waitForTimeout(2000);
      return true;
    }
  }

  console.log('  [로그인] 실패 - 10초 후에도 로그인 페이지에 머물러 있음');
  return false;
}

/** 로그인 상태를 확인하고, 풀렸으면 재로그인 */
async function ensureLoggedIn(page) {
  if (await isOnLoginPage(page)) {
    console.log('  [세션] 로그인이 풀렸습니다. 재로그인 중...');
    return await login(page);
  }
  return true;
}

/** 페이지 이동 후 검증까지 포함하는 캡처 함수 */
async function capture(page, name, urlPath, options = {}) {
  const { waitFor, fullPage = true, delay = 2000, maxRetry = 2 } = options;

  for (let attempt = 1; attempt <= maxRetry; attempt++) {
    console.log(`  [${name}] ${urlPath} 캡처 중... (시도 ${attempt}/${maxRetry})`);

    await page.goto(`${BASE_URL}${urlPath}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(delay);

    // 로그인 페이지로 리다이렉트됐는지 확인
    if (await isOnLoginPage(page)) {
      console.log(`  [${name}] 로그인 페이지로 리다이렉트됨! 재로그인 후 재시도...`);
      await login(page);
      continue; // 재시도
    }

    if (waitFor) {
      try {
        await page.waitForSelector(waitFor, { timeout: 5000 });
      } catch {
        console.log(`    경고: ${waitFor} 셀렉터를 찾지 못했습니다.`);
      }
    }

    const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
    await page.screenshot({ path: filePath, fullPage });

    // 최종 검증: 저장된 페이지가 로그인 페이지가 아닌지
    if (await isOnLoginPage(page)) {
      console.log(`  [${name}] 검증 실패 - 로그인 페이지가 캡처됨. 재시도...`);
      await login(page);
      continue;
    }

    console.log(`  [${name}] 저장 완료 (검증 통과)`);
    return true;
  }

  console.log(`  [${name}] ${maxRetry}회 시도 후에도 실패. 건너뜁니다.`);
  return false;
}

// ─── AI 도구 캡처 함수들 ───

async function captureAptitudeTest(page) {
  console.log('\n  === 적성검사 ===');
  await page.goto(`${BASE_URL}/marketing/school/tools/aptitude-test`, {
    waitUntil: 'networkidle', timeout: 30000,
  });
  await page.waitForTimeout(2000);

  if (await isOnLoginPage(page)) { await login(page); return; }

  try {
    // 시작 버튼 클릭
    const startBtn = page.locator('button').filter({ hasText: /시작|검사|테스트/ }).first();
    if (await startBtn.isVisible().catch(() => false)) {
      await startBtn.click();
      await page.waitForTimeout(1000);
    }

    // 질문에 자동 응답
    for (let q = 0; q < 15; q++) {
      const optionBtns = page.locator('button').filter({ hasText: /.{5,}/ });
      const count = await optionBtns.count();
      if (count >= 2) {
        await optionBtns.nth(q % 2).click();
        await page.waitForTimeout(800);
      } else {
        break;
      }
    }

    console.log('  결과 대기 중... (최대 30초)');
    await page.waitForTimeout(30000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '12_aptitude_result.png'),
      fullPage: true,
    });
    console.log('  [12_aptitude_result] 캡처 완료');
  } catch (e) {
    console.log(`  적성검사 오류: ${e.message}`);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '12_aptitude_result.png'), fullPage: true,
    });
  }
}

async function captureMarketScanner(page) {
  console.log('\n  === 시장조사 스캐너 ===');
  await page.goto(`${BASE_URL}/marketing/school/tools/market-scanner`, {
    waitUntil: 'networkidle', timeout: 30000,
  });
  await page.waitForTimeout(2000);

  if (await isOnLoginPage(page)) { await login(page); return; }

  try {
    const keywordInput = page.locator('input').first();
    await keywordInput.fill('수제 쿠키');

    const selects = page.locator('select');
    const selectCount = await selects.count();
    if (selectCount >= 1) await selects.nth(0).selectOption({ index: 1 });
    if (selectCount >= 2) await selects.nth(1).selectOption({ index: 2 });
    if (selectCount >= 3) await selects.nth(2).selectOption({ index: 1 });

    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '13_market_scanner_input.png'), fullPage: true,
    });
    console.log('  [13_market_scanner_input] 입력 폼 캡처 완료');

    const submitBtn = page.locator('button').filter({ hasText: /분석|시작|스캔/ }).first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      console.log('  분석 요청 중... (최대 60초 대기)');
      await page.waitForTimeout(60000);

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '14_market_scanner_result.png'), fullPage: true,
      });
      console.log('  [14_market_scanner_result] 결과 캡처 완료');
    }
  } catch (e) {
    console.log(`  시장조사 오류: ${e.message}`);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '14_market_scanner_result.png'), fullPage: true,
    });
  }
}

async function captureViralCardMaker(page) {
  console.log('\n  === 바이럴 카드 메이커 ===');
  await page.goto(`${BASE_URL}/marketing/school/tools/viral-card-maker`, {
    waitUntil: 'networkidle', timeout: 30000,
  });
  await page.waitForTimeout(2000);

  if (await isOnLoginPage(page)) { await login(page); return; }

  try {
    const inputs = page.locator('input[type="text"], input:not([type])');
    const inputCount = await inputs.count();
    if (inputCount >= 1) await inputs.nth(0).fill('수제 쿠키');
    if (inputCount >= 2) await inputs.nth(1).fill('20대 여성, 디저트 좋아하는 직장인');
    if (inputCount >= 3) await inputs.nth(2).fill('100% 수작업, 당일 배송');

    const toneBtn = page.locator('button, label').filter({ hasText: /감성/ }).first();
    if (await toneBtn.isVisible().catch(() => false)) await toneBtn.click();

    const styleBtn = page.locator('button, label').filter({ hasText: /일러스트/ }).first();
    if (await styleBtn.isVisible().catch(() => false)) await styleBtn.click();

    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '15_viral_card_input.png'), fullPage: true,
    });
    console.log('  [15_viral_card_input] 입력 폼 캡처 완료');

    const submitBtn = page.locator('button').filter({ hasText: /만들기|생성|시작/ }).first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      console.log('  생성 요청 중... (최대 60초 대기)');
      await page.waitForTimeout(60000);

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '16_viral_card_result.png'), fullPage: true,
      });
      console.log('  [16_viral_card_result] 결과 캡처 완료');
    }
  } catch (e) {
    console.log(`  바이럴카드 오류: ${e.message}`);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '16_viral_card_result.png'), fullPage: true,
    });
  }
}

async function captureROASSimulator(page) {
  console.log('\n  === ROAS 시뮬레이터 ===');
  await page.goto(`${BASE_URL}/marketing/school/tools/roas-simulator`, {
    waitUntil: 'networkidle', timeout: 30000,
  });
  await page.waitForTimeout(2000);

  if (await isOnLoginPage(page)) { await login(page); return; }

  try {
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute('type');
      const placeholder = (await input.getAttribute('placeholder')) || '';

      if (type === 'number' || placeholder.includes('가격') || placeholder.includes('원')) {
        if (i <= 1) await input.fill('15000');
        else await input.fill('300000');
      } else if (type === 'text' || !type) {
        await input.fill('수제 쿠키');
      }
    }

    const budgetBtn = page.locator('button').filter({ hasText: /30만/ }).first();
    if (await budgetBtn.isVisible().catch(() => false)) await budgetBtn.click();

    const channelBtn = page.locator('button').filter({ hasText: /인스타|Instagram/ }).first();
    if (await channelBtn.isVisible().catch(() => false)) await channelBtn.click();

    const selects = page.locator('select');
    if ((await selects.count()) >= 1) await selects.first().selectOption({ index: 2 });

    const durationBtn = page.locator('button').filter({ hasText: /14일/ }).first();
    if (await durationBtn.isVisible().catch(() => false)) await durationBtn.click();

    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '17_roas_input.png'), fullPage: true,
    });
    console.log('  [17_roas_input] 입력 폼 캡처 완료');

    const submitBtn = page.locator('button').filter({ hasText: /시뮬|분석|시작|계산/ }).first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      console.log('  시뮬레이션 요청 중... (최대 60초 대기)');
      await page.waitForTimeout(60000);

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '18_roas_result.png'), fullPage: true,
      });
      console.log('  [18_roas_result] 결과 캡처 완료');
    }
  } catch (e) {
    console.log(`  ROAS 오류: ${e.message}`);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '18_roas_result.png'), fullPage: true,
    });
  }
}

// ─── 메인 ───

async function main() {
  console.log('========================================');
  console.log('  깍두기학교 스크린샷 캡처 v3');
  console.log(`  URL: ${BASE_URL}`);
  console.log(`  계정: ${EMAIL}`);
  console.log(`  언어: 한국어(ko)`);
  console.log(`  저장: ./screenshots/`);
  console.log('========================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: 'ko-KR',
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();

  // 한국어 localStorage 설정 (첫 페이지 로드 전)
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.evaluate(() => {
    localStorage.setItem('i18nextLng', 'ko');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  try {
    // ===== 1. 메인 화면 (로그인 전) =====
    console.log('STEP 1: 메인 화면 캡처...');
    await capture(page, '01_main_gateway', '/', {
      waitFor: '[class*="gateway"], [class*="card"]',
    });

    // ===== 2. 로그인 =====
    console.log('\nSTEP 2: 로그인...');
    const loginSuccess = await login(page);
    if (!loginSuccess) {
      throw new Error('로그인에 실패했습니다. 이메일/비밀번호를 확인하세요.');
    }

    // ===== 3. 입학 축하 =====
    console.log('\nSTEP 3: 입학 축하 화면...');
    await capture(page, '02_register_complete', '/register-complete', { delay: 2000 });

    // ===== 4. 도장판 (도장 찍기 이전) =====
    console.log('\nSTEP 4: 도장판 (이전 상태)...');
    await capture(page, '03_stamp_before', '/marketing/school/attendance', {
      waitFor: '[class*="stamp"], [class*="grid"]', delay: 2000,
    });

    // ===== 5. 시간표 & 도구함 =====
    console.log('\nSTEP 5: 시간표 & 도구함...');
    await capture(page, '04_school_curriculum', '/marketing/school/curriculum', {
      waitFor: '[class*="timeline"], [class*="period"]',
    });
    await capture(page, '05_school_lab', '/marketing/school/lab', {
      waitFor: '[class*="tool"], [class*="card"]',
    });

    // ===== 6. AI 도구들 (가상 데이터 입력 + 결과) =====
    console.log('\nSTEP 6: AI 도구 - 가상 데이터 입력 & 결과...');
    await ensureLoggedIn(page);
    await captureAptitudeTest(page);

    await ensureLoggedIn(page);
    await captureMarketScanner(page);

    await ensureLoggedIn(page);
    await captureViralCardMaker(page);

    await ensureLoggedIn(page);
    await captureROASSimulator(page);

    // ===== 7. 도장판 (도구 사용 후) =====
    console.log('\nSTEP 7: 도장판 (이후 상태)...');
    await capture(page, '06_stamp_after', '/marketing/school/attendance', {
      waitFor: '[class*="stamp"], [class*="grid"]', delay: 2000,
    });

    // ===== 8. 학생증 =====
    console.log('\nSTEP 8: 학생증...');
    await capture(page, '07_student_card', '/marketing/school/attendance', {
      fullPage: false, delay: 2000,
    });

    // ===== 9. 졸업 플로우 =====
    console.log('\nSTEP 9: 졸업 화면...');
    await page.goto(`${BASE_URL}/marketing/school/curriculum`, {
      waitUntil: 'networkidle', timeout: 30000,
    });
    await page.waitForTimeout(2000);

    if (await isOnLoginPage(page)) await login(page);

    const graduateBtn = page.locator('button').filter({ hasText: /졸업/ }).first();
    if (await graduateBtn.isVisible().catch(() => false)) {
      console.log('  졸업하기 버튼 발견!');

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '08_before_graduation.png'), fullPage: true,
      });

      await graduateBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '09_graduation_ceremony.png'), fullPage: false,
      });
      console.log('  [09] 졸업 축하 캡처');

      await page.waitForTimeout(6000);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '10_graduation_result.png'), fullPage: false,
      });
      console.log('  [10] 졸업 결과 캡처');

      const certBtn = page.locator('button').filter({ hasText: /졸업장/ }).first();
      if (await certBtn.isVisible().catch(() => false)) {
        await certBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, '11_graduation_certificate.png'), fullPage: false,
        });
        console.log('  [11] 졸업장 캡처');

        const closeBtn = page.locator('button').filter({ hasText: /닫기|확인|X/ }).first();
        if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click();
        await page.waitForTimeout(1000);
      }
    } else {
      console.log('  졸업 버튼 없음 (이미 졸업했거나 도장 부족). 졸업 섹션 캡처...');
      await page.goto(`${BASE_URL}/marketing/school/attendance`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '09_graduation_section.png'), fullPage: false,
      });
    }

    // ===== 10. 졸업 후 프로필 (졸업 뱃지) =====
    console.log('\nSTEP 10: 졸업 후 프로필...');
    await capture(page, '19_profile_graduated', '/profile', { delay: 2000 });

    // ===== 11. 프로 교실 활성화 =====
    console.log('\nSTEP 11: 프로 교실...');
    await capture(page, '20_marketing_hub', '/marketing/hub', { delay: 2000 });
    await capture(page, '21_pro_dashboard', '/marketing/pro', { delay: 2000 });

    // ===== 12. 조별활동 =====
    console.log('\nSTEP 12: 조별활동...');
    await capture(page, '22_group_graduation_project', '/marketing/school/graduation-project', {
      delay: 2000,
    });

    await page.goto(`${BASE_URL}/marketing/school/curriculum`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    if (await isOnLoginPage(page)) await login(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '23_group_curriculum.png'), fullPage: true,
    });
    console.log('  [23] 조별활동 시간표 캡처');

    // ===== 최종 리포트 =====
    console.log('\n========================================');
    console.log('  캡처 완료!');
    console.log('========================================');
    const files = fs.readdirSync(SCREENSHOTS_DIR).filter((f) => f.endsWith('.png')).sort();
    console.log(`\n총 ${files.length}개 스크린샷:`);
    files.forEach((f) => console.log(`  - ${f}`));

  } catch (error) {
    console.error('\n[치명적 오류]', error.message);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'error_screenshot.png'), fullPage: true,
    });
    console.log('  오류 화면: screenshots/error_screenshot.png');
  } finally {
    await browser.close();
  }
}

main();
