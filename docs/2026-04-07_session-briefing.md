# 2026-04-07 작업 브리핑 — 마케팅 학과 런칭 D-3

> 런칭일: **2026-04-10** (오늘 기준 D-3)
> 대상: 외국인 30명, 현장 대면 수업
> 본 세션 초점: **마케팅 학과 6개 AI 도구 mockup 확정안 전면 반영** + **배포**

---

## ✅ 완료한 작업

### 1. 6개 AI 도구 mockup 확정안 전면 반영

| 교시 | 도구 | 핵심 변경 |
|---|---|---|
| **1교시** | 적성검사 | 보석함 저장 제거 → `profiles.marketing_persona` 학생증 뱃지로, 파란 안내 박스 추가 |
| **2교시** | 마켓스캐너 | 키워드 단일 입력 → `+버튼 리스트`(최대 5개), 검정 버튼 위계, "결과를 아이디어보석함에 저장하기 →" |
| **3교시** | 엣지메이커 | 자동 로드 → 수동 `📥 데이터 불러오기` 버튼, 강점 입력 `PlusListInput`, 다음 교시 CTA |
| **4교시** | 바이럴카드 | Pexels 실시간 이미지 + 5가지 레이아웃 템플릿(A~E), 카드 3·4번에만 브랜드명 노출, 🌶️ 자극형/💗 감성형/📊 정보형 |
| **5교시** | 퍼펙트플래너 | "상세페이지 만들기" 모바일 쇼핑몰 뷰(340px, 직각 모서리, sticky CTA), 라이브 방송 **큐시트** 형식 |
| **6교시** | ROAS시뮬레이터 | 시뮬레이터 → **자가 진단기**, 입력 3개만, 신호등(🔴/😐/📈), 큰 처방, 수식 계산(AI 호출 X) |

### 2. 신규 공통 컴포넌트 (`src/pages/marketing/school/tools/common/`)
- `PlusListInput.tsx` — 1️⃣2️⃣ + ✖ + ➕ 패턴의 리스트 입력 (6개 도구에서 재사용)
- `SaveToGemBoxButton.tsx` — 검정 큰 "결과를 아이디어보석함에 저장하기 →" 통일
- `TrafficLight.tsx` — ROAS 진단용 신호등
- `ViralCardTemplates.tsx` — 5가지 레이아웃(A~E) 한 파일에서 처리

### 3. 신규 서비스
- `src/services/pexelsService.ts` — Pexels API 검색 + sessionStorage 캐싱 (4교시용)
- `VITE_PEXELS_API_KEY` 환경변수 추가 (`.env.local` + `.env.example`)

### 4. 서비스 재작성 (Gemini 프롬프트)
- `roasSimulatorService.ts` — 역할 축소: 한 줄 처방 + 오늘 할 일만 생성, ROAS는 클라이언트 수식
- `perfectPlannerService.ts` — 출력 타입 전면 재설계 (`detailPage` + `liveScript`), `attentionLine` B/C형 랜덤
- `viralCardService.ts` — `imagePrompt` → `imageKeyword`(Pexels 검색용 짧은 영어), 카드별 템플릿 지정

### 5. 타입 재설계 (`src/types/school.ts`)
- `ROASInput/Output/Status/Channel` — 신규
- `DetailPagePlan / LiveScript / LiveCueSheetItem` — 신규
- `ViralCardSlide` — `imagePrompt/imageStyle` → `imageKeyword/template/showBrand/highlightWord`
- `ProfileRow`에 `marketing_persona: string | null` 추가 (`src/types/database.ts`)

### 6. DB 마이그레이션
- `supabase/migrations/20260407_add_marketing_persona.sql` 신규
- **운영 DB 적용 완료** (사용자가 Supabase Dashboard에서 직접 실행)
  ```sql
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marketing_persona TEXT;
  ```

### 7. 교안 인계 문서
- `docs/curriculum-update-notes.md` — 6교시 전체 정리
  - 한 줄 요약 / 입력 흐름 / 결과 화면 / 슬라이드 카피 / 삭제·수정·추가 항목 / 핵심 학습 포인트 / 영어 안내 / 개발자 노트

### 8. Mockup HTML (6개 + 공유 CSS)
- `docs/mockups/{aptitude-test,market-scanner,edge-maker,viral-card,perfect-planner,roas-simulator}.html` + `_shared.css` + `index.html`
- 각 파일 Before/After 비교, AFTER 컬럼이 실제 구현 기준

### 9. 배포
- Git 커밋 2개:
  - `dd552cc` — 마케팅 학과 6개 AI 도구 mockup 확정안 전면 반영 (19 files, +2902 / -2590)
  - `67e403a` — SEO/auth/layout/mockup 등 런칭 전 병행 작업 일괄 반영 (44 files, +3083 / -80)
- GitHub push → `infoamous-source/kkakdugi` main 브랜치
- Vercel **auto-deploy 진행 중** (main push 시 자동 트리거)

---

## 🚧 미처리 / 후속 작업

### 🔴 P0 (런칭 전 반드시 — 본 세션 범위 밖이었음)

아래 항목은 원래 `/Users/suni/.claude/plans/cryptic-painting-sprout.md` 에 잡혀 있던 P0지만, 사용자 지시("마케팅 도구 고도화 먼저")에 따라 본 세션에서 건드리지 않았어요. 런칭 전 반드시 처리해야 해요.

#### P0-1. 외국인 친화 회원가입 흐름
- `src/components/auth/LoginForm.tsx:276` 학생 모드에서 **네이버 OAuth 버튼** 노출 → 한국 거주자만 가입 가능
- `RegisterForm.tsx` 기관코드·선생님코드 둘 다 `required`
- 출생연도 드롭다운이 한국 양식(1940-2010)
- **조치 필요**: 네이버 버튼 숨김, 마스터 기관코드 `KKAKDUGI2026` 발급, 선생님코드 optional

#### P0-2. DB 동시성 / 30명 일괄 가입 안전망
- `AuthContext.tsx:247` `setTimeout(500ms)` 고정 지연 → 트리거 지연 시 프로필 미생성 위험
- auth.users → profiles 자동 트리거 존재 여부 미확인
- `consent_logs` 테이블 없음
- **조치 필요**: profiles row 존재 확인 폴링(200ms × 10회), 트리거 검증, 30명 동시 가입 부하 테스트

#### P0-3. 약관·개인정보처리방침 (한/영) + 동의
- 약관/개인정보처리방침 페이지 **전무**
- 가입 동의 체크박스 없음
- **조치 필요**: `TermsPage.tsx` / `PrivacyPage.tsx` 작성, 라우트 등록, RegisterForm에 동의 체크박스 + `consent_logs` 저장

#### P0-4. 영어 전역 토글 i18n 커버리지
- `i18n.ts:11-14` `supportedLngs: ['ko','en']` 정의만, 적용률 ~30%
- 6개 도구는 **Korean 하드코딩** 상태 (mockup 그대로 구현)
- **조치 필요**: Critical Path 8개 화면(Gateway → 학과 선택 → 가입/로그인 → 약관 → AI 셋업 → 학과 메인 → 학생증 → 졸업) 영어 i18n 키 일괄 추가, GatewayPage 우상단 KO/EN 토글

#### P0-5. 공용 기기 자동 로그아웃 + 사용자 전환
- 15분 무활동 자동 로그아웃 없음
- 학과 메인에 "수업 종료 / Sign out" 큰 버튼 없음
- `LoginForm.tsx:226-237` "자동 로그인" 체크박스가 공용 모드에서도 노출됨
- **조치 필요**: `AuthContext`에 idle 타이머, 공용 모드 토글

#### P0-6. AI 도구 안정성 (사용자 우려 #3)
- `geminiClient.ts` 재시도 로직 없음, timeout 없음
- `profileService.ts:127-137` `gemini_api_key` 평문 저장 + RLS 강화 필요
- 7개 Gemini 서비스 모두 일회 호출 + mock 폴백
- 30명 동시 호출 시 quota 소진 위험
- **조치 필요**: timeout 30초 + 지수 백오프 2회 재시도, API 키 검증 ping, RLS 정책 강화

#### P0-7. 보안체계 강화 (사용자 우려 #2)
- `AdminPage.tsx:19` / `CeoPage.tsx:19` 클라이언트 사이드 role 체크만 (localStorage 위조 가능)
- `AuthContext.tsx:76` Gemini API 키 `console.debug` 흔적 남음
- CSP 헤더 미설정
- 비밀번호 정책 확인 필요
- **조치 필요**: 서버 RPC `is_admin()/is_ceo()`, RLS 정책, CSP 헤더, 민감 로그 제거

### 🟡 P1 (런칭 후 사고 방지)
- RLS 정책 운영 DB 적용 검증 (`mcp__claude_ai_Supabase__get_advisors`)
- `ErrorBoundary` + 전역 에러 핸들러
- 환경변수·배포 스모크 (`service_role` 노출 0건 확인)
- 30명 동시 가입 부하 시뮬레이션 (k6/curl)

### 🟢 P2 (UX 보완)
- GatewayPage 첫 진입 언어 선택 모달
- 키오스크 시뮬레이터 영어 자막 (8개)
- Help/Resources placeholder → support 이메일 카드
- Empty state 한/영 메시지
- alt 텍스트 추가

### 🧪 MCP 기반 E2E 테스트 (사용자 직접 지시했던 것)
- 테스트 계정 3개 (`test1~3@kkakdugi.test`) × 전 과정 (가입 → API 키 → AI 도구 × 7 → 수업 → 도장 → 졸업)
- Supabase MCP로 RLS 격리 검증 (test2가 test1의 gemini_api_key 조회 시 거부 확인)
- 자동 로그아웃 15분 검증
- **조치 필요**: P0 완료 후 본격 실행

---

## 🧭 권장 다음 순서

교안 작업 끝나고 돌아오시면:

1. **P0-1 + P0-3** 가장 먼저 — 가입 흐름 막히면 학생이 아예 못 들어옴
2. **P0-4** — 영어 토글은 외국인 30명 대상 필수
3. **P0-2 + P0-6** — 30명 동시 가입 부하 + AI 안정성 (사용자 3대 우려 중 2개)
4. **P0-7** — 보안 일괄 점검
5. **P0-5** — 공용 기기 자동 로그아웃
6. **P1** — RLS 검증 + ErrorBoundary
7. **E2E 테스트** — 3계정 × 전 과정

이 순서로 하면 D-Day(4/10) 아침까지 아슬아슬하게 맞출 수 있어요.

---

## 📂 주요 파일 참조

### 작성/수정된 파일 (본 세션)
```
src/pages/marketing/school/tools/
├── AptitudeTestTool.tsx              (수정)
├── EdgeMakerTool.tsx                 (수정)
├── MarketScannerTool.tsx             (수정)
├── PerfectPlannerTool.tsx            (재작성 + 내부 DetailPagePreview/LiveScriptCueSheet)
├── ROASSimulatorTool.tsx             (재작성)
├── ViralCardMakerTool.tsx            (재작성)
└── common/                           (신규)
    ├── PlusListInput.tsx
    ├── SaveToGemBoxButton.tsx
    ├── TrafficLight.tsx
    └── ViralCardTemplates.tsx

src/services/
├── gemini/
│   ├── perfectPlannerService.ts      (재작성)
│   ├── roasSimulatorService.ts       (재작성 - 역할 축소)
│   └── viralCardService.ts           (재작성)
└── pexelsService.ts                  (신규)

src/types/
├── school.ts                         (ROAS/Perfect/Viral 타입 재설계)
└── database.ts                       (marketing_persona 추가)

supabase/migrations/
└── 20260407_add_marketing_persona.sql (신규, 운영 적용 완료)

docs/
├── curriculum-update-notes.md        (신규, 교안 담당자용)
├── 2026-04-07_session-briefing.md    (본 문서)
└── mockups/                          (Before/After HTML 6개)
    ├── _shared.css
    ├── index.html
    ├── aptitude-test.html
    ├── market-scanner.html
    ├── edge-maker.html
    ├── viral-card.html
    ├── perfect-planner.html
    └── roas-simulator.html

.env.local                            (VITE_PEXELS_API_KEY 추가)
.env.example                          (placeholder 추가)
```

### 참고할 기존 파일 (손대지 않음)
- `/Users/suni/.claude/plans/cryptic-painting-sprout.md` — 전체 런칭 계획 (P0~P2)
- `src/components/auth/LoginForm.tsx` — P0-1 작업 대상
- `src/contexts/AuthContext.tsx` — P0-2 작업 대상
- `src/services/gemini/geminiClient.ts` — P0-6 작업 대상

---

## 🔑 확정된 상수 / 비밀값

- **마스터 기관코드** (P0-1에서 발급 예정): `KKAKDUGI2026`
- **Pexels API 키**: `eC5k7i6RzdhfnDqlKdqTi3Px39PCo0V399LAg9WK4DQbUPKLe85KvCPW` (`.env.local`에 저장됨)
- **Supabase 운영 프로젝트**: `wcjeytljpqvwfyspewlz`
- **GitHub 레포**: `infoamous-source/kkakdugi` (main 브랜치)
- **Vercel 프로젝트**: `kkakdugi` (main push 시 자동 배포)

---

**작업자**: Claude Opus 4.6 (1M context)
**작성일**: 2026-04-07
**세션 길이**: 마케팅 도구 고도화 → 빌드 검증 → git push → 본 문서 작성
