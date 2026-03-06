/**
 * 깍두기학교 스크린샷 자동 캡처 스크립트 (확장판)
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

const EMAIL = process.argv[2] || 'tndls7529@naver.com';
const PASSWORD = process.argv[3] || 'qwer1234';

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

  const emailInput = page.locator('input[type="email"]');
  await emailInput.fill(EMAIL);

  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.fill(PASSWORD);

  const loginButton = page.locator('button[type="submit"]');
  await loginButton.click();

  await page.waitForTimeout(3000);
  console.log('  로그인 완료!');
}

// ─── AI 도구: 가상 데이터 입력 후 결과 캡처 ───

async function captureMarketScanner(page) {
  console.log('\n  [market-scanner] AI 도구 - 가상 데이터 입력 중...');
  await page.goto(`${BASE_URL}/marketing/school/tools/market-scanner`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await page.waitForTimeout(2000);

  // 입력 폼 캡처
  try {
    // 키워드 입력
    const keywordInput = page.locator('input').first();
    await keywordInput.fill('수제 쿠키');

    // 셀렉트 박스들 선택
    const selects = page.locator('select');
    const selectCount = await selects.count();
    if (selectCount >= 1) await selects.nth(0).selectOption({ index: 1 });
    if (selectCount >= 2) await selects.nth(1).selectOption({ index: 2 });
    if (selectCount >= 3) await selects.nth(2).selectOption({ index: 1 });

    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '12_market_scanner_input.png'),
      fullPage: true,
    });
    console.log('  [12_market_scanner_input] 입력 폼 캡처 완료');

    // 분석 버튼 클릭
    const submitBtn = page.locator('button').filter({ hasText: /분석|시작|스캔/ }).first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      console.log('  [market-scanner] 분석 요청 중... (최대 60초 대기)');
      // 로딩 완료 대기
      await page.waitForTimeout(60000);

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '13_market_scanner_result.png'),
        fullPage: true,
      });
      console.log('  [13_market_scanner_result] 결과 캡처 완료');
    }
  } catch (e) {
    console.log(`  [market-scanner] 캡처 중 오류: ${e.message}`);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '13_market_scanner_result.png'),
      fullPage: true,
    });
  }
}

async function captureViralCardMaker(page) {
  console.log('\n  [viral-card-maker] AI 도구 - 가상 데이터 입력 중...');
  await page.goto(`${BASE_URL}/marketing/school/tools/viral-card-maker`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await page.waitForTimeout(2000);

  try {
    // 텍스트 입력 필드들
    const inputs = page.locator('input[type="text"], input:not([type])');
    const inputCount = await inputs.count();
    if (inputCount >= 1) await inputs.nth(0).fill('수제 쿠키');
    if (inputCount >= 2) await inputs.nth(1).fill('20대 여성, 디저트 좋아하는 직장인');
    if (inputCount >= 3) await inputs.nth(2).fill('100% 수작업, 당일 배송');

    // 톤 선택 (라디오/버튼)
    const toneBtn = page.locator('button, label').filter({ hasText: /감성|emotional/ }).first();
    if (await toneBtn.isVisible().catch(() => false)) await toneBtn.click();

    // 이미지 스타일 선택
    const styleBtn = page.locator('button, label').filter({ hasText: /일러스트|illustration/ }).first();
    if (await styleBtn.isVisible().catch(() => false)) await styleBtn.click();

    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '14_viral_card_input.png'),
      fullPage: true,
    });
    console.log('  [14_viral_card_input] 입력 폼 캡처 완료');

    // 생성 버튼 클릭
    const submitBtn = page.locator('button').filter({ hasText: /만들기|생성|시작/ }).first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      console.log('  [viral-card-maker] 생성 요청 중... (최대 60초 대기)');
      await page.waitForTimeout(60000);

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '15_viral_card_result.png'),
        fullPage: true,
      });
      console.log('  [15_viral_card_result] 결과 캡처 완료');
    }
  } catch (e) {
    console.log(`  [viral-card-maker] 캡처 중 오류: ${e.message}`);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '15_viral_card_result.png'),
      fullPage: true,
    });
  }
}

async function captureROASSimulator(page) {
  console.log('\n  [roas-simulator] AI 도구 - 가상 데이터 입력 중...');
  await page.goto(`${BASE_URL}/marketing/school/tools/roas-simulator`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await page.waitForTimeout(2000);

  try {
    // 텍스트/숫자 입력
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute('type');
      const placeholder = (await input.getAttribute('placeholder')) || '';

      if (type === 'number' || placeholder.includes('가격') || placeholder.includes('원')) {
        if (i <= 1) await input.fill('15000'); // 상품 가격
        else await input.fill('300000'); // 광고 예산
      } else if (type === 'text' || !type) {
        await input.fill('수제 쿠키');
      }
    }

    // 예산 프리셋 버튼 (30만원)
    const budgetBtn = page.locator('button').filter({ hasText: /30만/ }).first();
    if (await budgetBtn.isVisible().catch(() => false)) await budgetBtn.click();

    // 채널 선택 (인스타그램)
    const channelBtn = page.locator('button').filter({ hasText: /인스타|Instagram/ }).first();
    if (await channelBtn.isVisible().catch(() => false)) await channelBtn.click();

    // 타겟 연령
    const selects = page.locator('select');
    if ((await selects.count()) >= 1) await selects.first().selectOption({ index: 2 });

    // 기간 선택 (14일)
    const durationBtn = page.locator('button').filter({ hasText: /14일/ }).first();
    if (await durationBtn.isVisible().catch(() => false)) await durationBtn.click();

    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '16_roas_input.png'),
      fullPage: true,
    });
    console.log('  [16_roas_input] 입력 폼 캡처 완료');

    // 시뮬레이션 버튼 클릭
    const submitBtn = page.locator('button').filter({ hasText: /시뮬|분석|시작|계산/ }).first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      console.log('  [roas-simulator] 시뮬레이션 요청 중... (최대 60초 대기)');
      await page.waitForTimeout(60000);

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '17_roas_result.png'),
        fullPage: true,
      });
      console.log('  [17_roas_result] 결과 캡처 완료');
    }
  } catch (e) {
    console.log(`  [roas-simulator] 캡처 중 오류: ${e.message}`);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '17_roas_result.png'),
      fullPage: true,
    });
  }
}

async function captureAptitudeTest(page) {
  console.log('\n  [aptitude-test] 적성검사 - 자동 응답 중...');
  await page.goto(`${BASE_URL}/marketing/school/tools/aptitude-test`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await page.waitForTimeout(2000);

  try {
    // 시작 버튼 클릭
    const startBtn = page.locator('button').filter({ hasText: /시작|검사|테스트/ }).first();
    if (await startBtn.isVisible().catch(() => false)) {
      await startBtn.click();
      await page.waitForTimeout(1000);
    }

    // 질문에 자동 응답 (A or B 번갈아 클릭)
    for (let q = 0; q < 15; q++) {
      const optionBtns = page.locator('button').filter({ hasText: /.{5,}/ });
      const count = await optionBtns.count();
      if (count >= 2) {
        // 첫 번째 옵션 선택
        await optionBtns.nth(q % 2).click();
        await page.waitForTimeout(800);
      } else {
        break;
      }
    }

    console.log('  [aptitude-test] 결과 대기 중... (최대 30초)');
    await page.waitForTimeout(30000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '18_aptitude_result.png'),
      fullPage: true,
    });
    console.log('  [18_aptitude_result] 결과 캡처 완료');
  } catch (e) {
    console.log(`  [aptitude-test] 캡처 중 오류: ${e.message}`);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '18_aptitude_result.png'),
      fullPage: true,
    });
  }
}

// ─── 메인 ───

async function main() {
  console.log('========================================');
  console.log('  깍두기학교 스크린샷 캡처 (확장판)');
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
    // ===== PART 1: 기본 화면 =====
    console.log('2. 메인 화면 캡처...');
    await capture(page, '01_main_gateway', '/', {
      waitFor: '[class*="gateway"], [class*="card"]',
    });

    // ===== 로그인 =====
    await login(page);

    // ===== 입학 축하 =====
    console.log('\n3. 입학 축하 화면 캡처...');
    await capture(page, '02_register_complete', '/register-complete', {
      delay: 2000,
    });

    // ===== PART 2: 도장 찍기 이전 (현재 상태) =====
    console.log('\n4. 도장판 (현재 상태) 캡처...');
    await capture(page, '03_stamp_before', '/marketing/school/attendance', {
      waitFor: '[class*="stamp"], [class*="grid"]',
      delay: 2000,
    });

    // ===== PART 3: 시간표 & 도구함 =====
    console.log('\n5. 시간표 & 도구함 캡처...');
    await capture(page, '04_school_curriculum', '/marketing/school/curriculum', {
      waitFor: '[class*="timeline"], [class*="period"]',
    });

    await capture(page, '05_school_lab', '/marketing/school/lab', {
      waitFor: '[class*="tool"], [class*="card"]',
    });

    // ===== PART 4: AI 도구 - 가상 데이터 입력 & 결과 캡처 =====
    console.log('\n6. AI 도구 - 가상 데이터 입력 & 결과 캡처...');

    // 적성검사
    await captureAptitudeTest(page);

    // 시장조사
    await captureMarketScanner(page);

    // 바이럴카드
    await captureViralCardMaker(page);

    // ROAS 시뮬레이터
    await captureROASSimulator(page);

    // ===== PART 5: 도장 찍은 후 (도구 사용 후 변경된 상태) =====
    console.log('\n7. 도장판 (도구 사용 후) 캡처...');
    await capture(page, '06_stamp_after', '/marketing/school/attendance', {
      waitFor: '[class*="stamp"], [class*="grid"]',
      delay: 2000,
    });

    // ===== PART 6: 학생증 =====
    console.log('\n8. 학생증 캡처...');
    await page.goto(`${BASE_URL}/marketing/school/attendance`, {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '07_student_card.png'),
      fullPage: false,
    });
    console.log('  [07_student_card] 저장 완료');

    // ===== PART 7: 졸업 시도 (시간표 탭에서 졸업하기 버튼) =====
    console.log('\n9. 졸업 화면 캡처 시도...');
    await page.goto(`${BASE_URL}/marketing/school/curriculum`, {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(2000);

    // 졸업하기 버튼 찾기
    const graduateBtn = page.locator('button').filter({ hasText: /졸업/ }).first();
    if (await graduateBtn.isVisible().catch(() => false)) {
      console.log('  졸업하기 버튼 발견! 클릭합니다...');

      // 졸업 전 시간표 캡처
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '08_before_graduation.png'),
        fullPage: true,
      });

      await graduateBtn.click();
      await page.waitForTimeout(3000);

      // 졸업 축하 애니메이션 캡처
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '09_graduation_ceremony.png'),
        fullPage: false,
      });
      console.log('  [09_graduation_ceremony] 졸업 축하 캡처 완료');

      // 결과 화면 대기 (5초 후 자동 전환)
      await page.waitForTimeout(6000);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '10_graduation_result.png'),
        fullPage: false,
      });
      console.log('  [10_graduation_result] 졸업 결과 캡처 완료');

      // 졸업장 받기 버튼 클릭
      const certBtn = page.locator('button').filter({ hasText: /졸업장/ }).first();
      if (await certBtn.isVisible().catch(() => false)) {
        await certBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, '11_graduation_certificate.png'),
          fullPage: false,
        });
        console.log('  [11_graduation_certificate] 졸업장 캡처 완료');

        // 모달 닫기
        const closeBtn = page.locator('button').filter({ hasText: /닫기|확인|X/ }).first();
        if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click();
        await page.waitForTimeout(1000);
      }
    } else {
      console.log('  졸업하기 버튼이 없습니다 (이미 졸업했거나 도장이 부족).');
      // 이미 졸업한 경우 - 등교 탭 하단 졸업 섹션 캡처
      await page.goto(`${BASE_URL}/marketing/school/attendance`, {
        waitUntil: 'networkidle',
      });
      await page.waitForTimeout(2000);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '09_graduation_section.png'),
        fullPage: false,
      });
      console.log('  [09_graduation_section] 졸업 섹션 캡처 완료');
    }

    // ===== PART 8: 졸업 후 프로필 (졸업 뱃지 표시) =====
    console.log('\n10. 졸업 후 프로필 캡처...');
    await capture(page, '19_profile_graduated', '/profile', {
      delay: 2000,
    });

    // ===== PART 9: 프로 교실 (졸업 후 활성화) =====
    console.log('\n11. 프로 교실 캡처...');

    // 마케팅 허브 (프로교실 카드 활성화 상태)
    await capture(page, '20_marketing_hub', '/marketing/hub', {
      delay: 2000,
    });

    // 프로 도구 대시보드
    await capture(page, '21_pro_dashboard', '/marketing/pro', {
      delay: 2000,
    });

    // ===== PART 10: 조별활동 =====
    console.log('\n12. 조별활동 캡처...');

    // 졸업 프로젝트 (팀원 표시, 보석함)
    await capture(page, '22_group_graduation_project', '/marketing/school/graduation-project', {
      delay: 2000,
    });

    // 시간표에서 조별 컨텍스트
    await page.goto(`${BASE_URL}/marketing/school/curriculum`, {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '23_group_curriculum.png'),
      fullPage: true,
    });
    console.log('  [23_group_curriculum] 조별활동 시간표 캡처 완료');

    // ===== 완료 =====
    console.log('\n========================================');
    console.log('  캡처 완료! screenshots/ 폴더를 확인하세요.');
    console.log('========================================');
    console.log('\n캡처된 파일 목록:');
    const files = fs.readdirSync(SCREENSHOTS_DIR).filter((f) => f.endsWith('.png')).sort();
    files.forEach((f) => console.log(`  - ${f}`));
    console.log(`\n총 ${files.length}개 스크린샷`);
  } catch (error) {
    console.error('\n오류 발생:', error.message);
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
