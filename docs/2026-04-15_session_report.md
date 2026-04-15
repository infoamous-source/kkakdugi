# 깍두기학교 작업 보고서 — 2026-04-08 ~ 2026-04-15

## 📌 세션 요약

커리어학과 0→100 구축 + 가입 폼 전면 개편 + 마케팅 도구 인프라 연동 + 프로모드 리뉴얼 + CEO 대시보드 통합

---

## ✅ 완료된 작업 (20건)

### 커리어학과 — 도구 3종 신규 구축
| # | 작업 | 핵심 파일 |
|---|---|---|
| 1 | **자소서 빌더 8단계** (강점발견→STAR인터뷰→자소서생성) | `src/pages/career/ResumeBuilderPage.tsx` + `steps/` 8개 |
| 2 | **K-이력서 빌더** (자소서 데이터 재사용) | `src/pages/career/KResumePage.tsx` |
| 3 | **면접 시뮬레이터** (8라운드 Q&A + AI 평가) | `src/pages/career/InterviewSimulatorPage.tsx` |

### 커리어학과 — 콘텐츠 자산
| # | 작업 | 수량 |
|---|---|---|
| 4 | 역량(trait) 라이브러리 | 45개 |
| 5 | 강점 카드 24장 (6카테고리×4) | `src/data/career/strengthCards.ts` |
| 6 | 결과 카드 템플릿 20개 | `src/data/career/strengthResults.ts` |
| 7 | STAR 질문 8개 + 후속질문 32개 | `src/data/career/starQuestions.ts` |

### 가입 폼 v6
| # | 작업 | 핵심 |
|---|---|---|
| 8 | **가입 폼 전면 개편** | 선생님코드/인증코드 삭제, 신규 3필드(TOPIK/체류/비자), 비자 칩UI |
| 9 | **학과별 추가 폼 폐지** | `SCHOOL_ADDITIONAL_FIELDS` deprecated |
| 10 | **기존 사용자 강제 보강 모달** | `ProfileGapModal.tsx` (현재 비활성화 — 사용자 피드백으로 제거) |
| 11 | **PRD v1.2** | `docs/prd-signup-form-v5.md` (7개 오픈이슈 전부 해결) |

### 사용자 데이터 인프라 (Phase B)
| # | 작업 | 핵심 파일 |
|---|---|---|
| 12 | **TOPIK 어휘 가이드** (0~6급별 AI 지시문) | `src/lib/userProfile/topikLevel.ts` |
| 13 | **비자별 자소서 전략** (11개 비자) | `src/lib/userProfile/visaStrategy.ts` |
| 14 | **체류 기간별 내러티브** (6구간) | `src/lib/userProfile/yearsInKorea.ts` |
| 15 | **AI 시스템 프롬프트 빌더** | `src/lib/userProfile/promptBuilder.ts` (bilingualFeedback 포함) |

### 마케팅학과
| # | 작업 | 핵심 |
|---|---|---|
| 16 | **학교 도구 7개 buildSystemPrompt 연동** | TOPIK 맞춤 + 코칭 병기 |
| 17 | **프로모드 5개 도구 리뉴얼** | 학교 데이터 프리필 + EditableSection + 부분 재생성 |
| 18 | **SNS 광고물(콘텐츠 스튜디오) 전면 업그레이드** | 6장, HOOK-EMPATHY-SOLUTION-ACTION, 사진업로드+인라인편집 |
| 19 | **상세페이지 프로 신규 도구** | 쿠팡/스마트스토어 스타일, 이미지삽입, 어그로B/C, 16단계 |

### CEO/관리
| # | 작업 | 핵심 |
|---|---|---|
| 20 | **CEO/강사 전지전능 모드** | 졸업·기간 우회 |
| 21 | **CEO 대시보드 통합** | /admin→/ceo 리다이렉트, 사이드바 링크 분기 |
| 22 | **팀·프로젝트 수업관리 통합** | CeoDashboard 수업관리 탭에 TeamManagement 추가 |
| 23 | **organizations RLS** | CEO 전체 기관 읽기 허용 SQL |

### 기타
| # | 작업 |
|---|---|
| 24 | PDF 내보내기 (`src/lib/pdfExport.ts`) |
| 25 | AI 코칭 피드백 한국어+영어 병기 (`bilingualFeedback`) |
| 26 | Supabase 세션 이중저장 (localStorage + DB) |
| 27 | LanguageSwitcher 컴포넌트 (현재 비활성화 — 가입폼에서 제거, 한국어 고정) |

---

## 🔴 미완료 작업 (내가 해야 하는 것)

| # | 작업 | 상세 | 우선순위 |
|---|---|---|---|
| 1 | **CEO 대시보드 CRUD 강화** | 모든 항목(강사/기관/학생/수업)에 수정/삭제/재연결/추가 기능 활성화 | P0 |
| 2 | **프로모드 AI 3개 buildSystemPrompt 연동** | 브랜드킷/콘텐츠스튜디오/리서치리포트의 프로 서비스에도 TOPIK 맞춤 적용 | P1 |
| 3 | **기관 학생 0명 확인** | RLS SQL 실행 완료 → CEO 로그인 후 정상 표시 확인 필요 | P0 |

---

## 🟡 사용자가 직접 해야 하는 것

| # | 작업 | 방법 | 상태 |
|---|---|---|---|
| 1 | **resume_builder_sessions 테이블 생성** | Supabase SQL Editor에서 `supabase/migrations/20260413_resume_builder_sessions.sql` 실행 | ⚠️ 미확인 |
| 2 | **CEO 로그인 후 기관 확인** | info.amous@gmail.com으로 로그인 → /ceo → 기관관리 탭 → 학생 수 확인 | ⚠️ 미확인 |
| 3 | **개인정보처리방침 갱신** | 비자·체류기간·TOPIK 수집 항목 추가 (법무 검토) | ⚠️ 미완 |
| 4 | **signup_form_v6 마이그레이션** | `supabase/migrations/20260408_signup_form_v6.sql` — profiles 컬럼 추가 | 🟡 다른 터미널에서 진행한 것으로 추정 |

---

## 🔜 추후 해야 할 것 (이번 세션에서 논의됨)

| # | 작업 | 상세 | 우선순위 |
|---|---|---|---|
| 1 | **커리어 cr-03 (구직)** | 비자별 채용공고 가이드, 연봉/계약서 해독기 | P2 |
| 2 | **커리어 cr-04 (직장생활)** | 직장 매너 시나리오, 존댓말 코치 | P2 |
| 3 | **음성 입력(STT)** | Web Speech API, 자소서 빌더 + 면접 시뮬레이터 | P1 |
| 4 | **Supabase 세션 → 실제 동작 확인** | resume_builder_sessions 테이블 생성 후 이중저장 검증 | P1 |
| 5 | **프로모드 도구 포폴 다운로드 강화** | PDF 일괄 내보내기, 포폴 표지 자동 생성 | P2 |
| 6 | **다국어 locale** | 현재 ko/en만. 필요 시 vi/zh/th 추가 가능 (인프라 준비됨) | P3 (보류) |
| 7 | **ProfileGapModal 재활성화 검토** | 기존 사용자 v6 필드 보강 — 현재 비활성화 상태 | P2 |

---

## 🏗️ 아키텍처 핵심 정보

### AI 도구 파이프라인 (모든 도구 공통)
```
사용자 가입 (profiles: korean_level/visa_type/years_in_korea)
  ↓
useUserProfile() → vocabularyGuide + visaStrategy + yearsStrategy
  ↓
buildSystemPrompt(profile, context) → 10섹션 자동 조합
  ↓
generateText(prompt) → Gemini API → 결과
```

### 자소서 빌더 세션이 3개 도구의 백본
```
자소서 빌더 세션 (useResumeBuilderSession)
├── 자소서 빌더 → 4항목 자소서
├── K-이력서 → 한국식 6섹션 이력서
└── 면접 시뮬레이터 → 맞춤 8질문 + AI 코칭
```

### 자소서 공식 (절대 위반 금지)
```
자소서 1개 항목 = 1~2개 역량 + 1~2개 구체 사례
→ 4항목 × (1~2역량 + 1~2사례) = 강점 5장 + STAR 답변 5~7개
```

### bilingualFeedback 정책
- **코칭/피드백** (면접평가, ROAS처방, 시장분석, 강점설명) → `bilingualFeedback: true` → 한국어 (English)
- **산출물** (자소서, 이력서, 카피, 카드뉴스, 기획안) → `bilingualFeedback: false` → 한국어만

### CEO 권한
- `/admin` 접속 → `/ceo` 자동 리다이렉트
- 졸업·기간·배정 모든 제한 우회
- 전체 기관·학생 조회 (RLS 정책 적용됨)
- 사이드바 대시보드 버튼 → `/ceo`로 이동

### DB 마이그레이션 파일 (미실행 시 SQL Editor에서 실행)
- `supabase/migrations/20260408_signup_form_v6.sql`
- `supabase/migrations/20260413_resume_builder_sessions.sql`

### 프로모드 도구 목록 (6개)
1. 시장 리서치 리포트 → `/marketing/pro/studio/market-research`
2. 브랜드 키트 → `/marketing/pro/studio/brand-kit`
3. 콘텐츠 스튜디오 (SNS 광고물) → `/marketing/pro/studio/content-studio`
4. 상세페이지 프로 → `/marketing/pro/studio/detail-page`
5. 랜딩페이지 빌더 → `/marketing/pro/studio/landing-builder`
6. 마케팅 대시보드 → `/marketing/pro/studio/marketing-dashboard`

---

## 📂 신규 생성된 주요 파일 목록

### 커리어학과
```
src/types/career/strengths.ts
src/types/career/resume.ts
src/data/career/traits.ts
src/data/career/strengthCards.ts
src/data/career/strengthResults.ts
src/data/career/starQuestions.ts
src/data/career/strengthMapping.ts
src/hooks/useResumeBuilderSession.ts
src/services/career/resumeBuilderService.ts
src/services/career/kResumeService.ts
src/services/career/interviewSimulatorService.ts
src/services/career/sessionService.ts
src/pages/career/ResumeBuilderPage.tsx
src/pages/career/KResumePage.tsx
src/pages/career/InterviewSimulatorPage.tsx
src/pages/career/steps/InitialProfileStep.tsx
src/pages/career/steps/CardPickingStep.tsx
src/pages/career/steps/NicknameStep.tsx
src/pages/career/steps/QuizStep.tsx
src/pages/career/steps/ResultRevealStep.tsx
src/pages/career/steps/InterviewStep.tsx
src/pages/career/steps/ResumeTargetStep.tsx
src/pages/career/steps/ResumeResultStep.tsx
```

### 인프라
```
src/lib/userProfile/topikLevel.ts
src/lib/userProfile/visaStrategy.ts
src/lib/userProfile/yearsInKorea.ts
src/lib/userProfile/promptBuilder.ts
src/lib/userProfile/useUserProfile.ts
src/lib/userProfile/index.ts
src/lib/pdfExport.ts
src/components/auth/ProfileGapModal.tsx
src/components/common/LanguageSwitcher.tsx (비활성화)
```

### 프로모드
```
src/pages/marketing/pro/common/SchoolDataBanner.tsx
src/pages/marketing/pro/common/EditableSection.tsx
src/pages/marketing/pro/common/ColorPickerInput.tsx
src/pages/marketing/pro/DetailPageTool.tsx
src/services/gemini/proMarketResearchService.ts
src/services/gemini/proBrandKitService.ts
src/services/gemini/proLandingService.ts
src/services/gemini/proDashboardService.ts
src/services/gemini/proContentStudioService.ts
src/services/gemini/proDetailPageService.ts
```

### DB
```
supabase/migrations/20260408_signup_form_v6.sql
supabase/migrations/20260413_resume_builder_sessions.sql
docs/prd-signup-form-v5.md
```
