# 깍두기학교 세션 브리핑 (2026-04-09 ~ 04-15)

**작성일**: 2026-04-15
**터미널 합류 대비 — 전체 현황 정리**

---

## 🔑 중요 정보 (인수인계용)

### 계정/인증
- **CEO 계정**: info.amous@gmail.com (role: ceo, id: 384d6d75-c598-4888-96fa-5dd3553c85ba)
- **DB user_role enum**: student, instructor, ceo
- **소셜 로그인**: 비활성 (VITE_ENABLE_SOCIAL_LOGIN 미설정, OAuth 앱 미발급)
- **프로덕션 URL**: https://kkakdugischool.vercel.app
- **Vercel 프로젝트**: kkakdugi (orgId: team_maHRCm6k0rzknQlLEgOrzbVC)

### Supabase
- **프로젝트**: wcjeytljpqvwfyspewlz (Oceania/Sydney)
- **Access Token**: sbp_211800dc4819488362465dc8b924f20e4b10f518
- **site_url**: kkakdugischool.vercel.app (mindflow에서 변경 완료)
- **RLS**: 전 테이블 활성화 완료 (보안 감사 2026-04-12)

### API 키
- **Gemini 모델**: gemini-2.5-flash-lite (다른 모델은 free tier 차단됨)
- **공통 키 3개**: KEY-A/B/C (quota 소진 후 → 개인 키 5개로 분배됨)
- **그룹 API 풀**: organizations.api_key_pool에 HUC454 키 6개 등록
- **풀 동작**: generateText 호출 시 라운드 로빈 → 429/403 시 자동 다음 키
- **Pexels**: VITE_PEXELS_API_KEY Vercel env에 등록됨
- **Vercel env**: VITE_GEMINI_FALLBACK_KEY, VITE_PEXELS_API_KEY

### 기관/학생
- **HUC454** (서울글로벌센터): 학생 31명, 5개 조, 교실: "예비 마케터 교실"
- **KKM394** (원주이주민지원센터): 학생 10명
- **KKAKDUGI2026** (현장반): 테스트 계정 3개
- **마스터 기관코드**: KKAKDUGI2026 (UI에서 숨김, 내부 로직만)
- **자율 가입 기관 (AUTO_CLASSROOM_ASSIGN)**: HUC454 → 5efa716c

---

## ✅ 완료된 작업

### 인프라/보안
| 작업 | 커밋/방법 |
|---|---|
| VitePWA 완전 제거 | vite.config.ts |
| i18n useSuspense: false | src/lib/i18n.ts |
| 전역 ErrorBoundary | src/components/common/ErrorBoundary.tsx |
| lazyWithRetry 37개 전체 적용 | src/utils/lazyWithRetry.ts + App.tsx |
| SW 강제 해제 스크립트 | index.html |
| Pretendard 폰트 비동기 | index.html |
| animate-page-enter opacity:1 + reduced-motion | index.css |
| 보안 감사 전 항목 조치 | SQL (RLS 7개 + 정책 20개+ + 인덱스 7개) |
| fetchProfile 컬럼 명시 (select * 제거) | AuthContext.tsx |
| AdminInquiry 하드 리다이렉트 | AdminInquiryPage.tsx |
| CSP 보안 헤더 5종 | vercel.json |
| Supabase site_url 수정 | Management API |

### 마케팅 도구
| 작업 | 파일 |
|---|---|
| 6개 도구 보석함 저장 버튼 상시 노출 | 5개 도구 파일 |
| 개인 보석함(idea_box_items) + 팀 보석함 | IdeaBox.tsx |
| 기존 결과 95건 자동 백필 | SQL |
| 바이럴카드 확대 팝업 + PNG 다운로드 | ViralCardMakerTool.tsx |
| 바이럴카드 명칭: 카드뉴스 → SNS 광고이미지 | ViralCardMakerTool.tsx |
| 이미지 선택 UI 제거 | ViralCardMakerTool.tsx |
| 상세페이지 프롬프트 강화 (고객·강점 필수) | perfectPlannerService.ts |
| 상세페이지 Pexels 한→영 변환 검색 (100+ 키워드) | pexelsService.ts |
| 적성검사 영문 병기 (CEO/PM/CPO/CMO/CSL) | locale JSON |
| 스크롤/카드 투명도 애니메이션 비활성 | index.css |

### 프로 마케터 교실
| 작업 | 파일 |
|---|---|
| 프로 도구 4개 제거 (페르소나/USP/컬러/ROI/SNS광고) | modules.ts, MarketingToolRouter.tsx |
| 해시태그 생성기 AI 업그레이드 | HashtagGeneratorTool.tsx |
| 프로 스튜디오 5개 신규: 시장리서치/브랜드키트/콘텐츠스튜디오/랜딩빌더/마케팅대시보드 | src/pages/marketing/pro/ |

### CEO/강사 대시보드
| 작업 | 파일 |
|---|---|
| CEO role DB 추가 + 계정 변경 | SQL |
| 수업 관리 탭 (수업 보고서 + 개발 보고서) | CeoDashboard.tsx, ClassReport.tsx, DevReport.tsx |
| 강사 대시보드 수업 보고서 탭 | AdminDashboard.tsx |
| CEO 대시보드 리뉴얼 (학생탭 제거, 기관·학생 통합, 통계 업그레이드) | CeoDashboard.tsx |
| 공지 관리 탭 (CEO 대시보드 통합) | CeoDashboard.tsx |

### 기능
| 작업 | 파일 |
|---|---|
| 그룹 API 풀 (라운드 로빈) | apiKeyPool.ts, geminiClient.ts, useApiKeyPool.ts |
| 공지사항 쪽지 시스템 | AnnouncementBanner.tsx, AdminAnnouncementsPage.tsx |
| 1:1 문의 게시판 (학생 비밀글 + 관리자 답글) | InquiryPage.tsx, AdminInquiryPage.tsx |
| 발표용 쇼케이스 (/showcase) | ShowcasePage.tsx |
| 5개 조 팀 배치 (27명) | SQL |
| 국가 6개 추가 (카자흐스탄 등) | countries.ts |
| 수료증 PNG 이미지 기반 (기요셰 프릴 네이비) | GraduationCertificate.tsx, public/certs/ |
| 로그인 자동로그인 학생 모드 숨김 | LoginForm.tsx |
| 카카오/구글 로그인 버튼 숨김 | LoginForm.tsx |
| ProfileGapModal 비활성 | MainLayout.tsx |
| 학과 배정 게이트 전면 제거 | TrackCard, Sidebar, MobileTabBar |
| enrollments/classroom_members 학생 INSERT RLS 추가 | SQL |
| AI 비서 설명 문구 변경 | AIWelcomePage.tsx |
| 모바일 CSS 안전망 | index.css |
| 영어 i18n 204키 채움 | en/common.json |
| 보석함 TXT/PDF 다운로드 (한글 깨짐 해결) | IdeaBox.tsx |

---

## ⏸️ 코드 완성 · 배포 대기

| 작업 | 조건 |
|---|---|
| 공지사항 첫 발송 | 사용자가 "배포하라" 할 때 |
| CEO 대시보드 리뉴얼 커밋 | 다른 터미널과 합칠 때 |

---

## 📋 설계 확정 · 구현 대기

### 13. CEO 긴급 알림 시스템
- **명세**: `/tmp/ceo_alerts_spec.md`
- **DB**: system_alerts 테이블 (CEO만 조회)
- **자동 감지**: API 실패(429/503), 빈 화면, 저장 실패 → 자동 알림
- **CEO 대시보드**: 상단 알림 패널 (30초 폴링, 해결 완료 버튼)
- **구독 중 학생 기술 이슈 대비용**

### 14. 사이렌 버튼
- **수업 모드**: 캡쳐 + 데이터 → 모니터링 → 자동 해결 or 터미널 알림
- **구독 모드**: 캡쳐 + "어떤 문제가 있어요?" 팝업 → 1:1 게시판 자동 업로드
- **위치**: 모든 도구에 플로팅 버튼
- **충돌 주의**: 6개 도구 파일 수정 필요 → 다른 터미널 끝난 후

### 15. 예시 데이터 블러 오버레이
- **감지 시**: 결과 영역 블러 + 오버레이
- **문구**: 한국어 + 영어만 (다국어 X)
- **"다시 시도" 버튼 → 3회 실패 시 "도움 요청" 강조**
- **사이렌 버튼 흔들림 애니메이션**
- **충돌 주의**: 6개 도구 파일 수정 필요 → 다른 터미널 끝난 후

---

## 📝 향후 구현 (설계만)

| 작업 | 비고 |
|---|---|
| 카카오/구글 OAuth | 앱 발급 후 Supabase 설정 + VITE_ENABLE_SOCIAL_LOGIN=true |
| 수업 생성 | CEO가 기관 등록 + 강사 배정. class_sessions 테이블 |
| 수업 복제 | 기존 수업 설정 복사, 전 필드 수정 가능 (과정명 포함) |
| 강사 셀프서비스 | 향후 확장 — 강사가 직접 기관 영업 + 수업 생성 + 폼 링크 |
| 기관별 강사 데이터 격리 | 강사 A가 기관 B 학생 못 보게 |
| Gemini 모델 Fallback 체인 | 그룹 API 풀에 일부 포함, 모델 체인은 미구현 |
| 다국어 AI 출력 | 학생 i18n 설정 따라 AI 결과 언어 변경 (한/영만) |
| 결과물 포트폴리오 PDF | 6교시 결과 통합 PDF |
| 오프라인 캐시 | localStorage 결과 미러링 |
| 구독형 기능 (학습 이력, 커뮤니티 등) | 아키텍처 변경 필요 |

---

## 🔴 주의 사항

### 다른 터미널과 충돌 주의 파일
- `src/pages/marketing/school/tools/*.tsx` (6개 도구) — 다른 터미널이 buildSystemPrompt 연동 + 프로모드 리뉴얼
- `src/services/gemini/*.ts` — 다른 터미널이 수정 중
- `src/components/admin/CeoDashboard.tsx` — 양쪽 모두 수정 (현재 합쳐진 상태)

### Gemini API 제한
- **gemini-2.5-flash-lite만 작동** (다른 모델 free tier 차단)
- **그룹 API 풀로 부하 분산** (라운드 로빈)
- Google이 **사전 공지 없이** 모델 차단 가능 — Fallback 체인 구현 권장

### 수료증
- **31명 PNG 사전 생성**: public/certs/
- **디자인**: 클래식 네이비 + 기요셰 프릴
- **내용**: 서울글로벌센터 / 직무역량강화교육 - 예비 마케터 양성과정 / 2026.04.09~10
- **생성 스크립트**: gen_certs.mjs (Puppeteer)
- **신규 학생 추가 시**: gen_certs.mjs 재실행 필요

### 공지사항
- **첫 공지 시드됨**: "수료증이 업데이트되었습니다!" (HUC454 대상)
- **배포 대기 중** — 사용자 지시 시 활성화
- **CEO 대시보드 공지 탭에서 관리**

---

## 📊 수업 데이터 요약 (서울글로벌센터 2026.04.09~10)

- 실제 학생: 25명 (테스트 6명 제외)
- 전 과정(5교시) 완료: 20/25명 (80%)
- AI Mock 폴백: 2교시 17%, 5교시 24%
- 보석함 총 173건, SNS 광고이미지 1위
- 5개 조 쇼케이스 100% 제출
- 피크 시간: 2일차 16~17시 (전체의 50%)
