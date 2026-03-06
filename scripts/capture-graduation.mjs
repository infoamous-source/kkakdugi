/**
 * 졸업 캡처 전용 스크립트 (빠진 도구 캡처 포함)
 *
 * 1) 빠진 도구(edge-maker, perfect-planner) 가상 데이터 입력 + 결과 캡처
 * 2) 도장 전부 완료 확인
 * 3) 졸업 버튼 → 졸업식 → 졸업 결과 → 졸업장
 * 4) 졸업 후 프로필/마케팅허브/프로교실 캡처
 *
 * 사용법:
 *   node scripts/capture-graduation.mjs [이메일] [비밀번호]
 */

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
const BASE_URL = 'https://kkakdugischool.vercel.app';

const EMAIL = process.argv[2] || 'tndls7529@naver.com';
const PASSWORD = process.argv[3] || 'qwer1234!';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function isOnLoginPage(page) {
  try {
    const url = page.url();
    if (url.includes('/login')) return true;
    return (await page.locator('input[type="password"]').count()) > 0;
  } catch {
    return false;
  }
}

async function login(page) {
  console.log('  [로그인] 시도 중...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  // 한국어 설정 (localStorage에 주입)
  await page.evaluate(() => {
    localStorage.setItem('i18nextLng', 'ko');
  });

  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(EMAIL);

  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill(PASSWORD);

  await page.waitForTimeout(500);

  const loginButton = page.locator('button[type="submit"]');
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await loginButton.click();

  // 로그인 완료 대기 - URL이 /login이 아닌 곳으로 이동할 때까지
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(500);
    const url = page.url();
    if (!url.includes('/login')) {
      console.log(`  [로그인] 성공! URL: ${url}`);
      await page.waitForTimeout(2000);
      return true;
    }
  }
  console.log('  [로그인] 실패 - 15초 후에도 로그인 페이지에 머물러 있음');
  return false;
}

async function ensureLoggedIn(page) {
  if (await isOnLoginPage(page)) {
    console.log('  [세션] 재로그인 중...');
    return await login(page);
  }
  return true;
}

async function shot(page, name, opts = {}) {
  const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: opts.fullPage ?? false });
  console.log(`  [${name}] 저장 완료`);
}

// ─── 3교시: Edge Maker (나만의 무기 만들기) ───

async function captureEdgeMaker(page) {
  console.log('\n=== 3교시: Edge Maker ===');
  await page.goto(`${BASE_URL}/marketing/school/tools/edge-maker`, {
    waitUntil: 'networkidle', timeout: 30000,
  });
  await page.waitForTimeout(3000);
  if (await isOnLoginPage(page)) { await login(page); return; }

  try {
    // 이전 결과가 있으면 result 화면이 자동 로드됨
    const resultSection = page.locator('text=USP').or(page.locator('text=슬로건'));
    if (await resultSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('  이전 결과 존재 → 결과 캡처');
      await shot(page, 'edge_maker_result', { fullPage: true });
      return;
    }

    // 강점 입력
    const strengthInput = page.locator('input[type="text"], input:not([type])').last();
    if (await strengthInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await strengthInput.fill('수작업 프리미엄 제조');

      // 추가 버튼 클릭
      const addBtns = page.locator('button').filter({ hasText: /추가/ });
      if (await addBtns.first().isVisible().catch(() => false)) {
        await addBtns.first().click();
        await page.waitForTimeout(500);
      }

      // 두 번째 강점 추가
      await strengthInput.fill('당일 배송 시스템');
      if (await addBtns.first().isVisible().catch(() => false)) {
        await addBtns.first().click();
        await page.waitForTimeout(500);
      }
    }

    // 입력 폼 캡처
    await page.waitForTimeout(500);
    await shot(page, 'edge_maker_input', { fullPage: true });

    // 분석 버튼 클릭
    const submitBtn = page.locator('button').filter({ hasText: /분석|생성|만들기|전략/ }).first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      console.log('  AI 분석 요청 중... (최대 60초)');
      await page.waitForTimeout(60000);

      // 결과 캡처
      await shot(page, 'edge_maker_result', { fullPage: true });
    }

    console.log('  Edge Maker 완료');
  } catch (e) {
    console.log(`  Edge Maker 오류: ${e.message}`);
    await shot(page, 'edge_maker_error', { fullPage: true });
  }
}

// ─── 5교시: Perfect Planner (설득의 기술) ───

async function capturePerfectPlanner(page) {
  console.log('\n=== 5교시: Perfect Planner ===');
  await page.goto(`${BASE_URL}/marketing/school/tools/perfect-planner`, {
    waitUntil: 'networkidle', timeout: 30000,
  });
  await page.waitForTimeout(3000);
  if (await isOnLoginPage(page)) { await login(page); return; }

  try {
    // 이전 결과가 있으면 result 화면이 자동 로드됨
    const resultSection = page.locator('text=판매 기획서').or(page.locator('text=랜딩페이지').or(page.locator('text=세일즈')));
    if (await resultSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('  이전 결과 존재 → 결과 캡처');
      await shot(page, 'perfect_planner_result', { fullPage: true });
      return;
    }

    // 입력 폼 채우기 (상품명, 핵심 타겟, USP, 강력 제안)
    const inputs = page.locator('input[type="text"], input:not([type]), textarea');
    const inputCount = await inputs.count();
    const values = ['수제 쿠키', '20대 여성 직장인', '100% 수작업 프리미엄', '첫 구매 30% 할인 + 무료배송'];

    for (let i = 0; i < Math.min(inputCount, values.length); i++) {
      const input = inputs.nth(i);
      if (await input.isVisible().catch(() => false)) {
        await input.fill(values[i]);
      }
    }

    // 입력 폼 캡처
    await page.waitForTimeout(500);
    await shot(page, 'perfect_planner_input', { fullPage: true });

    // 생성 버튼 클릭
    const submitBtn = page.locator('button').filter({ hasText: /생성|분석|시작|만들기|기획/ }).first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      console.log('  AI 생성 요청 중... (최대 60초)');
      await page.waitForTimeout(60000);

      // 결과 캡처
      await shot(page, 'perfect_planner_result', { fullPage: true });
    }

    console.log('  Perfect Planner 완료');
  } catch (e) {
    console.log(`  Perfect Planner 오류: ${e.message}`);
    await shot(page, 'perfect_planner_error', { fullPage: true });
  }
}

// ─── 메인 ───

async function main() {
  console.log('========================================');
  console.log('  졸업 + 빠진 도구 캡처 스크립트');
  console.log(`  URL: ${BASE_URL}`);
  console.log(`  계정: ${EMAIL}`);
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

  // 한국어 설정
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.evaluate(() => localStorage.setItem('i18nextLng', 'ko'));
  await page.reload({ waitUntil: 'networkidle' });

  try {
    // 1. 로그인
    const loginSuccess = await login(page);
    if (!loginSuccess) throw new Error('로그인 실패');

    // ─── PART A: 빠진 도구 입력/결과 캡처 ───

    console.log('\n[ PART A ] 빠진 도구 캡처');

    await ensureLoggedIn(page);
    await captureEdgeMaker(page);

    await ensureLoggedIn(page);
    await capturePerfectPlanner(page);

    // ─── PART B: 도장판 확인 ───

    console.log('\n[ PART B ] 도장판 확인');
    await page.goto(`${BASE_URL}/marketing/school/attendance`, {
      waitUntil: 'networkidle', timeout: 30000,
    });
    await page.waitForTimeout(3000);
    if (await isOnLoginPage(page)) await login(page);
    await shot(page, '06_stamp_all_complete', { fullPage: true });

    // ─── PART C: 졸업 플로우 ───

    console.log('\n[ PART C ] 졸업 플로우');
    await page.goto(`${BASE_URL}/marketing/school/curriculum`, {
      waitUntil: 'networkidle', timeout: 30000,
    });
    await page.waitForTimeout(3000);
    if (await isOnLoginPage(page)) await login(page);

    // 졸업 섹션까지 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);

    // 졸업하기 버튼 찾기
    const graduateBtn = page.locator('button').filter({ hasText: /졸업하기/ }).first();
    const isGraduateBtnVisible = await graduateBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (isGraduateBtnVisible) {
      console.log('  졸업하기 버튼 발견!');

      // 08: 졸업 전 시간표 (도장 완료 + 졸업 버튼)
      await shot(page, '08_before_graduation', { fullPage: true });

      // 졸업하기 클릭
      await graduateBtn.click();
      console.log('  졸업하기 클릭!');

      // 09: 졸업식 ceremony (confetti + 깍두기 캐릭터)
      await page.waitForTimeout(2500);
      await shot(page, '09_graduation_ceremony');

      // ceremony → result 자동 전환 (5초)
      console.log('  ceremony → result 전환 대기...');
      await page.waitForTimeout(4000);

      // 10: 졸업 결과 (프로교실 오픈 + 졸업장 받기)
      await shot(page, '10_graduation_result');

      // 졸업장 받기 클릭
      const certBtn = page.locator('button').filter({ hasText: /졸업장/ }).first();
      if (await certBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await certBtn.click();
        console.log('  졸업장 받기 클릭!');
        await page.waitForTimeout(3000);

        // 11: 졸업장 (수료증)
        await shot(page, '11_graduation_certificate');

        // 닫기
        const closeBtn = page.locator('button[aria-label="닫기"]').first();
        if (await closeBtn.isVisible().catch(() => false)) {
          await closeBtn.click();
          await page.waitForTimeout(1000);
        } else {
          // 텍스트로 찾기
          const closeTxt = page.locator('button').filter({ hasText: /닫기/ }).first();
          if (await closeTxt.isVisible().catch(() => false)) {
            await closeTxt.click();
            await page.waitForTimeout(1000);
          }
        }
      }
    } else {
      console.log('  졸업 버튼 없음 (이미 졸업했거나 도장 미완료)');

      // "졸업 완료!" 텍스트 확인
      const graduatedText = page.locator('text=졸업 완료');
      if (await graduatedText.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('  → 이미 졸업 완료 상태');
      } else {
        console.log('  → 도장이 아직 부족할 수 있음');
      }
      await shot(page, '08_curriculum_status', { fullPage: true });
    }

    // ─── PART D: 졸업 후 화면 ───

    console.log('\n[ PART D ] 졸업 후 화면');

    // 19: 프로필 (졸업 뱃지)
    await ensureLoggedIn(page);
    await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    if (await isOnLoginPage(page)) await login(page);
    await shot(page, '19_profile_graduated', { fullPage: true });

    // 20: 마케팅 허브 (프로교실 카드 활성화)
    await page.goto(`${BASE_URL}/marketing/hub`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    if (await isOnLoginPage(page)) await login(page);
    await shot(page, '20_marketing_hub', { fullPage: true });

    // 21: 프로 교실 대시보드
    await page.goto(`${BASE_URL}/marketing/pro`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    if (await isOnLoginPage(page)) await login(page);
    await shot(page, '21_pro_dashboard', { fullPage: true });

    // ─── 결과 리포트 ───
    console.log('\n========================================');
    console.log('  캡처 완료!');
    console.log('========================================');

    const files = fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith('.png')).sort();
    const newFiles = files.filter(f =>
      ['06_stamp_all', '08_', '09_', '10_', '11_', '19_', '20_', '21_', 'edge_maker', 'perfect_planner'].some(p => f.startsWith(p) || f.includes(p))
    );
    console.log(`\n이번에 캡처된 스크린샷 (${newFiles.length}개):`);
    newFiles.forEach(f => console.log(`  - ${f}`));

  } catch (error) {
    console.error('\n[오류]', error.message);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'error_graduation.png'), fullPage: true,
    });
    console.log('  오류 화면: screenshots/error_graduation.png');
  } finally {
    await browser.close();
  }
}

main();
