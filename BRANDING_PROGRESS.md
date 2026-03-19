# 깍두기 학교 브랜딩 진행내역

> 작성일: 2025-02-10
> 프로젝트: 깍두기 학교 (Kkakdugi School)
> 배포: https://kkakdugi-seven-gamma.vercel.app/

---

## 1일차 (세션 1) — 계획 수립 + Phase 1~4

### ✅ 완료

| Phase | 작업 | 수정/생성 파일 |
|-------|------|---------------|
| **계획 수립** | 8단계 브랜딩 계획 수립, 캐릭터 V1→V2→V4 업데이트 반영 | - |
| **Phase 1** | 깍두기 캐릭터 SVG 컴포넌트 3종 제작 | `src/components/brand/KkakdugiCharacter.tsx` (신규) |
| | | `src/components/brand/KkakdugiMascot.tsx` (신규) |
| | | `src/components/brand/SchoolIllustrations.tsx` (신규) |
| **Phase 2** | 글로벌 스타일 & kk-* 컬러 시스템 | `src/index.css` |
| **Phase 3** | 메인 페이지 (GatewayPage + TrackCard) 리디자인 | `src/pages/GatewayPage.tsx` |
| | | `src/components/gateway/TrackCard.tsx` |
| **Phase 4** | 마케팅 허브 페이지 리디자인 | `src/pages/marketing/MarketingHubPage.tsx` |

---

## 2일차 (세션 2) — Phase 5~8 + 배포

### ✅ 완료

| Phase | 작업 | 수정/생성 파일 |
|-------|------|---------------|
| **Phase 5** | 공통 컴포넌트 브랜딩 (6개) | `src/components/common/Sidebar.tsx` |
| | Sidebar: 로고→깍두기마스코트, Lucide→학교SVG아이콘, kk-*컬러 | `src/components/common/TopHeader.tsx` |
| | TopHeader: 아바타 kk-cream/peach, 드롭다운 kk-*컬러 | `src/components/common/MainLayout.tsx` |
| | MainLayout: bg-gray-50→bg-kk-bg | `src/components/common/MobileTabBar.tsx` |
| | MobileTabBar: 학과SVG아이콘, 활성색 kk-red-deep | `src/components/school/SchoolBottomNav.tsx` |
| | SchoolBottomNav: 학교SVG아이콘, 활성색 kk-red-deep | `src/components/layout/Footer.tsx` |
| | Footer: emoji→깍두기마스코트+연필/별 아이콘 | |
| **Phase 6** | "깍두기 학교란?" 상세 페이지 + 라우트 등록 | `src/pages/AboutPage.tsx` (신규) |
| | 브랜드스토리, 3개학과소개, 교실시스템, CTA, 운영정보 | `src/App.tsx` (/about 라우트 추가) |
| **Phase 7** | 하위 페이지 브랜딩 통일 (5개) | `src/pages/CongratsPage.tsx` |
| | CongratsPage: PartyPopper→깍두기캐릭터+별/연필 장식 | `src/pages/marketing/school/MarketingSchoolLayout.tsx` |
| | MarketingSchoolLayout: 깍두기마스코트+마케팅학과아이콘 | `src/components/school/StudentCard.tsx` |
| | StudentCard: indigo-purple→kk-cream/warm/peach 학생증 | `src/pages/ProfilePage.tsx` |
| | ProfilePage: 프로필헤더→깍두기마스코트, kk-*컬러 | |
| **Phase 8** | i18n 용어 통일 (ko + en) | `public/locales/ko/common.json` |
| | | `public/locales/en/common.json` |

---

## 용어 변경표

| 변경 전 | 변경 후 (ko) | 변경 후 (en) |
|---------|-------------|-------------|
| Kkakdugi Seven | 깍두기 학교 | Kkakdugi School |
| 교육 플랫폼 | 이주민/유학생을 위한 교육 학교 | Education School for Migrants & Students |
| 디지털 기초 | 디지털 학과 | Digital Dept. |
| 마케팅 실무 | 마케팅 학과 | Marketing Dept. |
| 취업 역량 | 커리어 학과 | Career Dept. |
| 모듈 | 교실 | Classroom |
| 커리큘럼 | 시간표 | Timetable |
| 홈 | 학교 현관 | Entrance |
| 학습 자료 | 도서관 | Library |
| 예비 마케터 학교 | 예비 마케터 교실 | Beginner Classroom |
| Pro 도구 | 프로 마케터 교실 | Pro Classroom |

---

## 컬러 시스템 (kk-* palette)

| 변수 | 값 | 용도 |
|------|-----|------|
| `kk-bg` | #faf7f2 | 전체 배경 |
| `kk-cream` | #fef3dc | 카드/배지 배경 |
| `kk-warm` | #fce8c3 | 보더/구분선 |
| `kk-red` | #e8816b | 주요 액션 |
| `kk-red-deep` | #c43025 | 활성/강조 |
| `kk-peach` | #f5b89a | 그라디언트 |
| `kk-blush` | #f4a08a | 뺨/볼터치 |
| `kk-brown` | #4a3a2e | 텍스트 |
| `kk-gold` | #f7c88a | 졸업/배지 |
| `kk-coral` | #f4a0a0 | 보조 액센트 |
| `kk-navy` | #2c3e6b | 교복 블레이저 |

학과 컬러: `dept-digital` (#3B82F6), `dept-marketing` (#8B5CF6), `dept-career` (#10B981)

---

## 미진행 / 추후 작업

| 항목 | 상태 | 비고 |
|------|------|------|
| LoginPage 브랜딩 | ❌ 미진행 | 로그인 폼 배경/버튼 kk-* 적용 필요 |
| RegisterPage 브랜딩 | ❌ 미진행 | 회원가입 폼 배경/버튼 kk-* 적용 필요 |
| RegisterCompletePage 브랜딩 | ❌ 미진행 | 가입완료 페이지 깍두기 캐릭터 적용 |
| AIWelcomePage 브랜딩 | ❌ 미진행 | AI 연결 페이지 kk-* 적용 |
| AdminPage (강사 대시보드) 브랜딩 | ❌ 미진행 | 관리자 페이지는 우선순위 낮음 |
| ProToolsDashboard 브랜딩 | ❌ 미진행 | 프로 도구 페이지 kk-* 적용 |
| AttendanceTab/CurriculumTab/LabTab 컬러 | ❌ 미진행 | 내부 탭 컨텐츠 kk-* 컬러 적용 |
| PeriodDetailPage 브랜딩 | ❌ 미진행 | 교시 상세 페이지 kk-* 적용 |
| 기타 12개 언어 i18n 업데이트 | ❌ 미진행 | zh, ja, vi, th 등 나머지 번역 파일 |
| data/tracks.ts 용어 변경 | ❌ 미진행 | 트랙 데이터 파일 내 용어 통일 |
| footer.madeWith / footer.disclaimer 번역키 | ❌ 미진행 | ko/en에 해당 키 추가 필요 |
| 파비콘/OG이미지 교체 | ❌ 미진행 | 깍두기 캐릭터 기반 파비콘 |

---

## 수정 파일 전체 목록 (21개)

### 신규 생성 (4개)
1. `src/components/brand/KkakdugiCharacter.tsx`
2. `src/components/brand/KkakdugiMascot.tsx`
3. `src/components/brand/SchoolIllustrations.tsx`
4. `src/pages/AboutPage.tsx`

### 수정 (17개)
5. `src/index.css`
6. `src/App.tsx`
7. `src/pages/GatewayPage.tsx`
8. `src/components/gateway/TrackCard.tsx`
9. `src/pages/marketing/MarketingHubPage.tsx`
10. `src/components/common/Sidebar.tsx`
11. `src/components/common/TopHeader.tsx`
12. `src/components/common/MainLayout.tsx`
13. `src/components/common/MobileTabBar.tsx`
14. `src/components/school/SchoolBottomNav.tsx`
15. `src/components/layout/Footer.tsx`
16. `src/pages/CongratsPage.tsx`
17. `src/pages/marketing/school/MarketingSchoolLayout.tsx`
18. `src/components/school/StudentCard.tsx`
19. `src/pages/ProfilePage.tsx`
20. `public/locales/ko/common.json`
21. `public/locales/en/common.json`
