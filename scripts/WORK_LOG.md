# 깍두기학교 스크린샷 캡처 작업 로그

## 작업 일자: 2026-03-06

---

## 완료된 작업

### 1. 메인 캡처 스크립트 (`capture-screenshots.mjs`)
- Playwright 기반 자동 캡처 스크립트 v3
- iPhone 모바일 뷰포트 (375x812, 2x 레티나)
- 한국어(ko) 강제 설정
- 로그인 유지 + 자동 재로그인
- **32장 캡처 완료**

### 2. 졸업 캡처 스크립트 (`capture-graduation.mjs`)
- 빠진 도구(3교시 edge-maker, 5교시 perfect-planner) 입력/결과 캡처
- 6개 도장 전부 완료 후 졸업 플로우 캡처
- 졸업 후 프로필/마케팅허브/프로교실 캡처

### 3. 비밀번호 수정
- `qwer1234` → `qwer1234!` (두 스크립트 모두)

---

## 캡처 완료 목록 (메인 스크립트)

| # | 파일명 | 설명 |
|---|--------|------|
| 01 | `01_main_gateway.png` | 메인 화면 (3개 학과 카드) |
| 02 | `02_register_complete.png` | 입학 축하 화면 |
| 03 | `03_stamp_before.png` | 도장판 (도구 사용 전) |
| 04 | `04_school_curriculum.png` | 시간표 (6교시 커리큘럼) |
| 05 | `05_school_lab.png` | 도구함 (AI 도구 목록) |
| 06 | `06_stamp_after.png` | 도장판 (도구 사용 후) |
| 07 | `07_student_card.png` | 학생증 |
| 12 | `12_aptitude_result.png` | 적성검사 결과 |
| 13 | `13_market_scanner_input.png` | 시장조사 스캐너 입력 |
| 14 | `14_market_scanner_result.png` | 시장조사 스캐너 결과 |
| 15 | `15_viral_card_input.png` | 바이럴 카드 메이커 입력 |
| 16 | `16_viral_card_result.png` | 바이럴 카드 메이커 결과 |
| 17 | `17_roas_input.png` | ROAS 시뮬레이터 입력 |
| 18 | `18_roas_result.png` | ROAS 시뮬레이터 결과 |
| 19 | `19_profile_graduated.png` | 프로필 (졸업 뱃지) |
| 20 | `20_marketing_hub.png` | 마케팅 허브 |
| 21 | `21_pro_dashboard.png` | 프로 교실 대시보드 |
| 22 | `22_group_graduation_project.png` | 졸업 프로젝트 |
| 23 | `23_group_curriculum.png` | 시간표 하단 조별활동 |

## 졸업 캡처 스크립트 추가 캡처 대상

| 파일명 | 설명 |
|--------|------|
| `edge_maker_input.png` | 3교시 Edge Maker 입력 |
| `edge_maker_result.png` | 3교시 Edge Maker 결과 |
| `perfect_planner_input.png` | 5교시 Perfect Planner 입력 |
| `perfect_planner_result.png` | 5교시 Perfect Planner 결과 |
| `06_stamp_all_complete.png` | 도장 6개 전부 완료 |
| `08_before_graduation.png` | 졸업 전 시간표 (졸업 버튼 보임) |
| `09_graduation_ceremony.png` | 졸업식 (confetti + 캐릭터) |
| `10_graduation_result.png` | 졸업 결과 (프로교실 오픈 + 졸업장 받기) |
| `11_graduation_certificate.png` | 졸업장 (수료증) |

---

## 미처리 작업

### fullPage 스크린샷 → 모바일 분할 캡처로 변경

**문제:**
현재 `fullPage: true`로 캡처하면 세로로 매우 긴 이미지가 생성됨.
소개서에 넣기엔 비율이 맞지 않고, 내용이 뭉개져 보임.

**해결 방안:**
긴 스크린샷을 모바일 화면 크기(375x812)에 맞춰 분할 캡처.

**변경 내용:**

```javascript
// 기존: 페이지 전체를 한 장으로 캡처
await page.screenshot({ path: filePath, fullPage: true });

// 변경: 모바일 뷰포트 높이 기준으로 스크롤하며 분할 캡처
async function captureScrollSlices(page, baseName, opts = {}) {
  const { viewportHeight = 812, overlap = 50 } = opts;

  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  const sliceCount = Math.ceil(totalHeight / (viewportHeight - overlap));

  const files = [];
  for (let i = 0; i < sliceCount; i++) {
    const scrollY = i * (viewportHeight - overlap);
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(300);

    const filePath = path.join(SCREENSHOTS_DIR, `${baseName}_${i + 1}.png`);
    await page.screenshot({ path: filePath, fullPage: false }); // 뷰포트만 캡처
    files.push(filePath);
  }

  console.log(`  [${baseName}] ${files.length}장 분할 캡처 완료`);
  return files;
}
```

**적용 대상 (fullPage가 긴 페이지):**
- `04_school_curriculum` - 시간표 (9개 섹션, 매우 김)
- `08_before_graduation` - 졸업 전 시간표
- `edge_maker_result` - Edge Maker 결과
- `perfect_planner_result` - Perfect Planner 결과
- `14_market_scanner_result` - 시장조사 결과
- `18_roas_result` - ROAS 결과

**짧은 페이지는 기존 방식 유지:**
- `01_main_gateway` - 메인 화면
- `09_graduation_ceremony` - 졸업식 모달
- `10_graduation_result` - 졸업 결과 모달
- `11_graduation_certificate` - 졸업장 모달

---

## 파일 구조

```
scripts/
  capture-screenshots.mjs    # 메인 캡처 스크립트 (32장)
  capture-graduation.mjs     # 졸업 전용 캡처 스크립트
  README-screenshots.md       # 스크린샷 사용 가이드
  WORK_LOG.md                # 이 파일
screenshots/                  # 캡처 결과 저장 폴더 (.gitignore)
```
