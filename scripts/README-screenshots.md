# 깍두기학교 스크린샷 캡처 가이드

Mac에서 터미널을 열고 아래 순서대로 따라하세요.

## 1단계: 터미널 열기

- Spotlight 검색 (Cmd + Space) → "터미널" 입력 → Enter

## 2단계: 프로젝트 폴더로 이동

```bash
cd kkakdugi
```

(만약 프로젝트가 다른 곳에 있으면 해당 경로로 이동하세요)

## 3단계: Playwright 설치 (최초 1회만)

```bash
npm install -D @playwright/test
npx playwright install chromium
```

- 첫 번째 명령어: Playwright 라이브러리 설치
- 두 번째 명령어: Chromium 브라우저 다운로드 (약 200MB)

## 4단계: 스크린샷 캡처 실행

```bash
node scripts/capture-screenshots.mjs tndls7529@naver.com qwer1234
```

- 실행하면 자동으로 11개 화면을 캡처합니다
- 약 1~2분 소요

## 5단계: 결과 확인

`screenshots/` 폴더에 다음 파일들이 생성됩니다:

| 파일명 | 화면 |
|--------|------|
| 01_main_gateway.png | 메인 화면 (3개 학과 카드) |
| 02_register_complete.png | 입학 축하 화면 |
| 03_school_attendance.png | 교실 - 등교 탭 (출석 도장판) |
| 04_school_curriculum.png | 교실 - 시간표 탭 |
| 05_school_lab.png | 교실 - 도구함 탭 |
| 06_tool_market_scanner.png | AI 도구 - 시장 스캐너 |
| 07_tool_viral_card_maker.png | AI 도구 - 바이럴 카드 메이커 |
| 08_tool_roas_simulator.png | AI 도구 - ROAS 시뮬레이터 |
| 09_student_card.png | 학생증 |
| 10_profile.png | 프로필 페이지 |
| 11_graduation_section.png | 졸업 섹션 |

## 문제 해결

### "command not found: node"
Node.js가 설치되지 않았습니다.
```bash
# Homebrew로 설치
brew install node

# 또는 https://nodejs.org 에서 직접 다운로드
```

### "Cannot find module '@playwright/test'"
3단계를 다시 실행하세요.

### "error_screenshot.png만 생성됨"
로그인에 실패했을 수 있습니다. 계정 정보를 확인하세요.
