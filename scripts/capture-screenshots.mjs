/**
 * 깍두기학교 스크린샷 자동 캡처 스크립트
 *
 * 사용법:
 *   npm install -D @playwright/test
 *   npx playwright install chromium
 *   node scripts/capture-screenshots.mjs [이메일] [비밀번호]
 *
 * 예시:
 *   node scripts/capture-screenshots.mjs tndls7529@naver.com qwer1234
 */

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
const BASE_URL = 'https://kkakdugischool.vercel.app';

// 커맨드라인 인자에서 계정 정보 읽기
const EMAIL = process.argv[2] || 'tndls7529@naver.com';
const PASSWORD = process.argv[3] || 'qwer1234';

// 스크린샷 저장 폴더 생성
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function capture(page, name, urlPath, options = {}) {
  const { waitFor, fullPage = true, delay = 1500 } = options;

  console.log(`  [${name}] ${urlPath} 캡처 중...`);

  await page.goto(`${BASE_URL}${urlPath}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(delay);

  if (waitFor) {
    try {
      await page.waitForSelector(waitFor, { timeout: 5000 });
    } catch {
      console.log(`    경고: ${waitFor} 셀렉터를 찾지 못했습니다. 현재 상태로 캡처합니다.`);
    }
  }

  const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage });
  console.log(`  [${name}] 저장 완료: screenshots/${name}.png`);
}

async function login(page) {
  console.log('\n1. 로그인 중...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 이메일 입력
  const emailInput = page.locator('input[type="email"]');
  await emailInput.fill(EMAIL);

  // 비밀번호 입력
  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.fill(PASSWORD);

  // 로그인 버튼 클릭
  const loginButton = page.locator('button[type="submit"]');
  await loginButton.click();

  // 로그인 완료 대기 (페이지 이동)
  await page.waitForTimeout(3000);
  console.log('  로그인 완료!');
}

async function main() {
  console.log('========================================');
  console.log('  깍두기학교 스크린샷 캡처 시작');
  console.log(`  URL: ${BASE_URL}`);
  console.log(`  계정: ${EMAIL}`);
  console.log(`  저장: ./screenshots/`);
  console.log('========================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();

  try {
    // === 로그인 전 캡처 ===
    console.log('2. 로그인 불필요 화면 캡처...');
    await capture(page, '01_main_gateway', '/', {
      waitFor: '[class*="gateway"], [class*="card"]',
    });

    // === 로그인 ===
    await login(page);

    // === 입학 축하 화면 ===
    console.log('\n3. 입학 축하 화면 캡처...');
    await capture(page, '02_register_complete', '/register-complete', {
      delay: 2000,
    });

    // === 마케팅 교실 탭들 ===
    console.log('\n4. 마케팅 교실 캡처...');
    await capture(page, '03_school_attendance', '/marketing/school/attendance', {
      waitFor: '[class*="stamp"], [class*="card"]',
      delay: 2000,
    });

    await capture(page, '04_school_curriculum', '/marketing/school/curriculum', {
      waitFor: '[class*="timeline"], [class*="period"]',
    });

    await capture(page, '05_school_lab', '/marketing/school/lab', {
      waitFor: '[class*="tool"], [class*="card"]',
    });

    // === AI 도구 화면들 ===
    console.log('\n5. AI 도구 화면 캡처...');
    await capture(page, '06_tool_market_scanner', '/marketing/school/tools/market-scanner', {
      delay: 2000,
    });

    await capture(page, '07_tool_viral_card_maker', '/marketing/school/tools/viral-card-maker', {
      delay: 2000,
    });

    await capture(page, '08_tool_roas_simulator', '/marketing/school/tools/roas-simulator', {
      delay: 2000,
    });

    // === 학생증 (프로필) ===
    console.log('\n6. 학생증 화면 캡처...');

    // 등교 탭에서 학생증 보기 버튼 클릭 시도
    await page.goto(`${BASE_URL}/marketing/school/attendance`, {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(2000);

    // 학생증 영역 스크린샷 (등교 탭 상단)
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '09_student_card.png'),
      fullPage: false,
    });
    console.log('  [09_student_card] 저장 완료');

    // === 졸업장/수료증 ===
    console.log('\n7. 졸업장 화면 캡처 시도...');

    // 프로필 페이지에서 졸업 관련 UI 캡처
    await capture(page, '10_profile', '/profile', {
      delay: 2000,
    });

    // 등교 탭 하단 졸업 섹션
    await page.goto(`${BASE_URL}/marketing/school/attendance`, {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(2000);

    // 페이지 끝까지 스크롤 (졸업 섹션)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '11_graduation_section.png'),
      fullPage: false,
    });
    console.log('  [11_graduation_section] 저장 완료');

    console.log('\n========================================');
    console.log('  캡처 완료! screenshots/ 폴더를 확인하세요.');
    console.log('========================================\n');
  } catch (error) {
    console.error('\n오류 발생:', error.message);
    // 오류 발생 시 현재 화면 캡처
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'error_screenshot.png'),
      fullPage: true,
    });
    console.log('  오류 화면을 screenshots/error_screenshot.png에 저장했습니다.');
  } finally {
    await browser.close();
  }
}

main();
