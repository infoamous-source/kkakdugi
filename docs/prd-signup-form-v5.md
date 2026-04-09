# PRD — 깍두기학교 가입 폼 v5 (학과별 추가 등록 폐지 + 공통 필수 정보 통합)

- **문서 버전**: v1.0
- **작성일**: 2026-04-08
- **작성자**: CEO 김이사 (Claude)
- **상태**: 초안 (사용자 승인 대기)
- **관련 코드**: `src/components/auth/RegisterForm.tsx`, `src/data/schoolFields.ts`, `src/components/enrollment/*`

---

## 1. 배경 (Background)

### 1.1 현재 가입 절차의 문제
깍두기학교는 외국인(이주민·유학생·근로자) 학습자를 타깃으로 한 교육 플랫폼이다. 현재 가입 절차는 **2단계로 분리**되어 있다.

1. **회원가입** (`RegisterForm.tsx`) — 이름·이메일·기관코드 등 공통 정보
2. **학과별 추가 등록** (`SchoolEnrollmentForm.tsx` + `SCHOOL_ADDITIONAL_FIELDS`) — 학과를 선택할 때마다 별도의 추가 폼이 표시됨

이 구조는 다음과 같은 문제를 야기한다.

- **외국인 학습자에게 진입 장벽이 큼** — 가입 후 학과를 또 등록해야 하며, 한국어로 이루어지는 추가 폼이 부담스러움
- **학과를 추가할 때마다 폼 작성** — 디지털→마케팅→커리어 3개 학과 모두 듣는 학생은 폼을 3번 작성
- **데이터 파편화** — 각 학과별로 받는 정보가 달라서 학과 간 정보 공유가 어려움. AI 도구가 학생 프로필을 종합적으로 활용하지 못함
- **중복·혼선** — `work_experience_korea` 같은 필드는 커리어학과에만 있지만 디지털·마케팅 학과에서도 유용한 정보임
- **선생님코드와 기관코드 중복 입력** — 기관 = 강사 1:1 매칭인데도 학생이 둘 다 입력해야 함

### 1.2 사용자 피드백
> "추후 등록하는 게 어려워. 학과별로 정보 추가를 하는 게 아니라 공통 질문들만 가입할 때 받고 싶어." — 사용자(CEO)

---

## 2. 목표 (Goals)

### 2.1 비즈니스 목표
- 외국인 학습자의 가입 완료율 향상
- 학과 등록 단계에서의 이탈률 감소
- AI 도구(자소서 빌더, K-이력서, 면접 시뮬레이터 등)의 추천·생성 정확도 향상

### 2.2 제품 목표
1. **가입 절차 단일화**: 가입 폼 1개로 모든 학과 학습 시작 가능
2. **공통 필수 정보 최소 수집**: 모든 학과·도구가 공통으로 필요로 하는 핵심 정보만 가입 시 수집
3. **학과 등록 = 1클릭**: 학과별 추가 폼 폐지, 학과 카드 클릭만으로 등록 완료
4. **강사 자동 매칭**: 기관코드만 입력하면 강사가 자동 연결
5. **TOPIK 3-4 친화**: 모든 라벨·안내문은 쉬운 한국어 + 영어 병기

### 2.3 비목표 (Non-Goals)
- 도구별 온보딩(예: 자소서 빌더의 0단계 강점 발견) 설계 — 별도 PRD로 분리
- 강사·CEO 가입 절차 전면 개편 — 본 PRD는 학생 가입에 한정
- 기존 데이터의 과거 정보 보강 — 신규 가입자부터 적용 (기존 사용자는 별도 마이그레이션 배너)

---

## 3. 사용자 시나리오 (User Scenarios)

### 시나리오 A: 베트남 청년 (E-9, 한국 1년차, TOPIK 3)
1. 친구 추천으로 깍두기학교 접속
2. 마스터 기관코드 `KKAKDUGI2026` 입력하고 가입 폼 작성 (2~3분)
3. 한국어 수준·체류 기간·비자 입력 (드롭다운 3개)
4. 가입 완료 → 메인 화면 → "디지털 기초" 학과 카드 클릭 → **즉시 등록 완료**
5. 학과 학습 시작

### 시나리오 B: 결혼이민 여성 (F-6, 한국 5년차, TOPIK 4)
1. 마을 다문화센터 강사가 알려준 기관코드로 가입
2. 가입 시점에 강사 자동 매칭됨 (별도 입력 X)
3. 가입 완료 → 메인 화면 → "마케팅" 학과 카드 클릭 → 즉시 등록
4. 마케팅 도구 진입 시, 도구가 가입 시 입력한 정보(체류 기간 5년)를 활용해 한국어 어휘 자연스럽게 조정

### 시나리오 C: 유학생 (D-2, 한국 6개월, TOPIK 5)
1. 학교 동기로부터 추천
2. 가입 → 커리어 학과 클릭 → 자소서 빌더 사용
3. 자소서 빌더는 가입 정보(체류 6개월, 비자 D-2)를 보고 "한국 경험" 질문 비중을 낮추고 "모국·학업 경험" 질문 비중을 높임

---

## 4. 가입 폼 v5 명세 (Specification)

### 4.1 필드 전체 목록 (총 11개 필수 + 1개 숨김 토글)

| # | 필드 ID | 라벨 (한/영) | 타입 | 필수 | 비고 |
|---|---|---|---|---|---|
| 1 | `name` | 이름 (Name) | text | ⭐ | 기존 유지 |
| 2 | `country` | 국가 (Country) | select | ⭐ | 기존 유지, COUNTRIES 리스트 |
| 3 | `gender` | 성별 (Gender) | radio | ⭐ | 기존 유지, 남/여 |
| 4 | `birthYear` | 출생년도 (Year of Birth) | select | ⭐ | 기존 유지, 1940~2010 |
| 5 | `email` | 이메일 (Email) | email | ⭐ | 기존 유지 |
| 6 | `password` + `passwordConfirm` | 비밀번호 / 비밀번호 확인 (Password / Confirm Password) | password | ⭐ | 기존 유지, 영문+숫자+특수문자 8자 |
| 7 | `orgCode` | 기관코드 (Institution Code) | text | ⭐ | 기존 유지, 강사 자동 매칭 |
| 8 | `koreanLevel` | 한국어 어느 정도 할 수 있어요? (How well do you speak Korean?) | select | ⭐ | 🆕 TOPIK 0~6 |
| 9 | `yearsInKorea` | 한국에 온 지 얼마나 됐어요? (How long have you been in Korea?) | select | ⭐ | 🆕 6구간 |
| 10 | `visaType` | 어떤 비자가 있어요? (What visa do you have?) | select | ⭐ | 🆕 8개 옵션 |
| — | `staffAuthCode` | 직원이신가요? (Are you a staff member?) | text (toggle) | ⚪ | 숨김 토글, 체리/딸기 |
| 11 | `agreeTerms` + `agreePrivacy` + `agreeMarketing` | 약관·개인정보·마케팅 동의 | checkbox | ⭐(2)+⚪(1) | 기존 유지 |

### 4.2 신규 필드 옵션 상세

#### 8. `koreanLevel` (한국어 수준)
```
- topik0  : TOPIK 0 (모름 / None)
- topik1  : TOPIK 1
- topik2  : TOPIK 2
- topik3  : TOPIK 3
- topik4  : TOPIK 4
- topik5  : TOPIK 5
- topik6  : TOPIK 6 (잘함 / Fluent)
```

#### 9. `yearsInKorea` (한국 체류 기간)
```
- under6m : 6개월 안 됐어요 (Less than 6 months)
- 6m_1y   : 6개월 ~ 1년 (6 months ~ 1 year)
- 1y_3y   : 1년 ~ 3년 (1 ~ 3 years)
- 3y_5y   : 3년 ~ 5년 (3 ~ 5 years)
- 5y_10y  : 5년 ~ 10년 (5 ~ 10 years)
- over10y : 10년 넘었어요 (Over 10 years)
```

#### 10. `visaType` (비자 종류)
```
- E7    : E-7 (전문직 / Professional)
- E9    : E-9 (일반 취업 / Non-professional)
- F2    : F-2 (거주 / Residence)
- F4    : F-4 (재외동포 / Overseas Korean)
- F5    : F-5 (영주 / Permanent)
- F6    : F-6 (결혼 / Marriage)
- D2    : D-2 (유학 / Study)
- D4    : D-4 (어학연수 / Language)
- H2    : H-2 (방문취업 / Working Visit)
- other : 기타 (Other)
- none  : 비자 없음 / 모름 (No visa / Don't know)
```

### 4.3 삭제되는 것
- ❌ `instructorCode` 필드 — 기관코드로 자동 매칭됨
- ❌ `authCode` 필드 — 숨김 토글로 분리 (UI에서 기본 숨김)
- ❌ `SCHOOL_ADDITIONAL_FIELDS` 전체 — 학과별 추가 폼 폐지
- ❌ `SchoolEnrollmentForm` 컴포넌트 사용 — 폐지 또는 deprecated

### 4.4 UX 흐름

```
[메인 → 가입 클릭]
       ↓
[RegisterForm 표시]
       ↓
[기본 정보 입력 (1~7번)]
       ↓
[한국 생활 정보 입력 (8~10번)]
       ↓
[(선택) 직원이신가요? 토글]
       ↓
[약관 동의]
       ↓
[가입하기 버튼]
       ↓
[register-complete 페이지]
       ↓
[메인 → 학과 카드 클릭 → 1클릭 등록]
       ↓
[학과 학습 시작]
```

---

## 5. 데이터 모델 & DB 변경 (Data Model)

### 5.1 `profiles` 테이블 변경 (Supabase)

```sql
ALTER TABLE profiles
  ADD COLUMN korean_level    TEXT,
  ADD COLUMN years_in_korea  TEXT,
  ADD COLUMN visa_type       TEXT;

-- 인덱스 (필터링·통계용)
CREATE INDEX idx_profiles_korean_level   ON profiles(korean_level);
CREATE INDEX idx_profiles_years_in_korea ON profiles(years_in_korea);
CREATE INDEX idx_profiles_visa_type      ON profiles(visa_type);
```

### 5.2 `school_profiles` 테이블 정책
- **유지**: 도구별 온보딩 결과를 저장할 용도로 보존
- **deprecate 대상 필드**: 기존 `data` JSONB 안의 `visa_type`, `korean_level`, `work_experience_korea`, `desired_industry`는 신규 가입자에게는 더 이상 수집하지 않음
- **기존 데이터**: 그대로 보존, 마이그레이션 스크립트로 `profiles` 테이블의 신규 컬럼으로 백필

### 5.3 백필 마이그레이션 (기존 가입자)

```sql
-- 커리어학과 등록자의 school_profile에서 정보 추출
UPDATE profiles p
SET
  korean_level   = sp.data->>'korean_level',
  visa_type      = sp.data->>'visa_type'
FROM school_profiles sp
WHERE p.id = sp.student_id
  AND sp.school_id = 'career'
  AND p.korean_level IS NULL;
```

`years_in_korea`는 기존 데이터에 없으므로, 기존 사용자는 NULL로 두고 일회성 보강 모달로 받음.

### 5.4 `organizations` 테이블 (변경 없음)
이미 `instructor_id` 컬럼이 있어 강사 자동 매칭 가능.

---

## 6. API 변경

### 6.1 `validateOrgCode()` 응답 확장 (`organizationService.ts`)

```typescript
// Before
{
  valid: boolean;
  orgName: string | null;
}

// After
{
  valid: boolean;
  orgName: string | null;
  instructorId: string | null;     // 🆕
  instructorName: string | null;   // 🆕
}
```

### 6.2 `register()` 함수 시그니처 (`AuthContext.tsx`)

```typescript
// 추가될 인자
register({
  // ... 기존 인자
  koreanLevel: string;
  yearsInKorea: string;
  visaType: string;
  instructorId?: string | null;    // 🆕 자동 매칭 결과
  // 제거: instructorCode (deprecated)
})
```

### 6.3 학과 등록 API (`enrollmentService.ts`)

```typescript
// 학과 등록을 추가 정보 없이 1클릭으로
enrollSchool(studentId, schoolId)
  // 내부적으로 enrollment 레코드만 생성
  // school_profile은 도구 온보딩 시에만 생성
```

---

## 7. 영향 받는 파일 (Affected Files)

| 파일 | 변경 내용 |
|---|---|
| `src/components/auth/RegisterForm.tsx` | 메인 변경 — 필드 추가/삭제, 토글, 강사 자동 매칭 표시 |
| `src/contexts/AuthContext.tsx` | `register()` 시그니처 변경 |
| `src/services/profileService.ts` | 신규 필드 저장, `validateInstructorCode` 호출 제거 |
| `src/services/organizationService.ts` | `validateOrgCode` 응답 확장 |
| `src/services/enrollmentService.ts` | 학과 1클릭 등록 함수 추가/단순화 |
| `src/data/schoolFields.ts` | `SCHOOL_ADDITIONAL_FIELDS` deprecate (또는 삭제) |
| `src/components/enrollment/SchoolEnrollmentModal.tsx` | 정보 입력 단계 제거, 1클릭 확인만 |
| `src/components/enrollment/SchoolEnrollmentForm.tsx` | 사용 중단 (또는 도구 온보딩으로 이전) |
| `src/types/enrollment.ts` | `SchoolField` 타입 그대로 유지 (도구 온보딩에서 재사용) |
| `public/locales/{ko,en,vi,zh,...}/common.json` | 신규 라벨 ~30개 추가 |
| `supabase/migrations/*` | DB 마이그레이션 SQL |
| `src/pages/RegisterCompletePage.tsx` | 다음 안내 흐름 검토 (변경 없을 수도) |

---

## 8. i18n (다국어 지원)

### 8.1 신규 i18n 키 (각 언어별 추가)

```json
{
  "register": {
    "koreanLevelLabel": "한국어 어느 정도 할 수 있어요?",
    "koreanLevelLabelEn": "How well do you speak Korean?",
    "yearsInKoreaLabel": "한국에 온 지 얼마나 됐어요?",
    "yearsInKoreaLabelEn": "How long have you been in Korea?",
    "visaTypeLabel": "어떤 비자가 있어요?",
    "visaTypeLabelEn": "What visa do you have?",
    "staffToggleLabel": "직원이신가요?",
    "staffToggleLabelEn": "Are you a staff member?",
    "staffCodeHint": "일반 학생은 비워두세요",
    "staffCodeHintEn": "Students leave this blank"
  },
  "enrollment": {
    "common": {
      "yik_under6m": "6개월 안 됐어요",
      "yik_6m_1y": "6개월 ~ 1년",
      "yik_1y_3y": "1년 ~ 3년",
      "yik_3y_5y": "3년 ~ 5년",
      "yik_5y_10y": "5년 ~ 10년",
      "yik_over10y": "10년 넘었어요"
      // ... 비자, TOPIK 등
    }
  }
}
```

### 8.2 지원 언어
- 한국어 (필수)
- 영어 (필수)
- 베트남어, 중국어, 태국어, 필리핀어, 우즈벡어, 캄보디아어 등 (기존 지원 언어 유지)

---

## 9. 마이그레이션 계획 (Existing Users)

### 9.1 신규 가입자
- 즉시 v5 폼 적용

### 9.2 기존 가입자
1. **DB 백필**: 커리어학과 등록자는 `school_profile.data`에서 `visa_type`, `korean_level`을 `profiles` 테이블로 자동 백필
2. **일회성 보강 배너**: 첫 로그인 시 메인 화면 상단에 "추가 정보를 입력하면 더 정확한 맞춤 학습이 가능해요" 배너
3. **보강 모달**: 배너 클릭 시 누락된 필드(주로 `years_in_korea`)만 입력하는 미니 모달
4. **강제하지 않음**: 입력 안 해도 사용은 가능, 단 일부 도구는 정확도가 떨어질 수 있음

---

## 10. 리스크 & 대응 (Risks & Mitigations)

| # | 리스크 | 영향도 | 대응 |
|---|---|---|---|
| R1 | 가입 폼 길이 증가로 이탈률 상승 | 중 | 신규 필드 3개만 추가, 모두 단순 드롭다운, 평균 가입 시간 2~3분 유지 |
| R2 | 기존 사용자 정보 누락 | 중 | DB 백필 + 일회성 보강 배너로 점진 수집 |
| R3 | 비자 정보 수집의 법무 리스크 | 높 | 개인정보처리방침 갱신 필수, 법무팀장 검토 필요 |
| R4 | 학과별 필드를 도구로 옮기는 작업 누락 | 중 | 각 학과 도구별 후속 PRD에서 처리 (디지털·마케팅) |
| R5 | 기관코드를 모르는 학생의 가입 실패 | 낮 | 마스터 코드 `KKAKDUGI2026` 배너 유지 |
| R6 | DB 마이그레이션 중 다운타임 | 낮 | 컬럼 추가는 즉시 실행 가능, 백필은 비동기 |
| R7 | 기존 `school_profile` 데이터 손실 | 낮 | 폐기 X, 보존만 (도구 온보딩에서 재활용) |
| R8 | 인증코드 토글이 학생에게 노출되어 혼란 | 낮 | 토글은 작은 텍스트 링크, 약관 동의 위에 배치 |

---

## 11. 성공 지표 (Success Metrics)

| 지표 | Before | Target |
|---|---|---|
| 가입 완료율 (시작 → 완료) | TBD | ↑ 10% 이상 |
| 학과 첫 등록까지 평균 시간 | 가입 + 학과 폼 (≈ 5분) | ≈ 2분 (1클릭) |
| 학생당 평균 등록 학과 수 | TBD | ↑ |
| 자소서 빌더 정확도 (NPS) | N/A | 출시 후 측정 |
| 기존 사용자 정보 보강률 (배너 → 입력) | N/A | 출시 후 측정 |

---

## 12. 작업 분배 (Team Assignment)

### 12.1 팀별 책임
| 팀장 | 책임 |
|---|---|
| **PM (pm-lead)** | 본 PRD 관리, 일정 조율, 리스크 추적 |
| **개발팀장 (dev-lead)** | `RegisterForm.tsx` 외 영향 파일 코드 작업 |
| **DBA (dba-lead)** | DB 마이그레이션 SQL, 백필 스크립트 |
| **디자인팀장 (design-lead)** | 가입 폼 UI 디자인 (드롭다운 3개 자연스럽게 통합), 토글 UI |
| **콘텐츠팀장 (content-lead)** | 모든 라벨·옵션 텍스트 TOPIK 3-4 검수, 다국어 라벨 작성 |
| **법무팀장 (legal-lead)** | 개인정보처리방침 갱신 (비자·체류 기간 수집 항목 추가) |
| **보안팀장 (security-lead)** | 비자 정보 저장·접근 권한 검토, RLS 정책 검토 |
| **QA팀장 (qa-lead)** | 가입 흐름 E2E 테스트, 기존 사용자 마이그레이션 검증 |

### 12.2 작업 순서 (의존성)
1. **법무 검토** (개인정보처리방침 갱신) — 코드 작업 전 완료
2. **DB 마이그레이션** (컬럼 추가) — 코드 배포 전 완료
3. **콘텐츠 작성** (라벨·다국어) — 디자인·개발과 병렬
4. **디자인** (UI 와이어프레임) — 콘텐츠 확정 후
5. **개발** (코드 작업) — 디자인·콘텐츠 확정 후
6. **QA** (테스트) — 개발 완료 후
7. **마이그레이션 스크립트** (백필) — 배포 시
8. **배포** (스테이징 → 프로덕션)
9. **기존 사용자 보강 배너 활성화** (배포 후 1주)

---

## 13. 오픈 이슈 → 결정 사항 (Resolved)

1. **Q**: 기관코드 없는 일반 가입(일반 웹 사용자)도 허용할 것인가?
   - **✅ 결정 (사용자, 2026-04-08)**: **비허용**. 깍두기학교는 기관 단위로만 오픈한다.
   - **추가 작업**: 현재 DB에 기관코드 없이 등록된 기존 사용자를 위해 `TEST_LEGACY` 같은 임시 테스트 기관을 1개 만들고, 모든 무소속 사용자를 그 그룹으로 일괄 이관.

2. **Q**: 비자 종류 옵션을 어떻게 표시할 것인가?
   - **✅ 결정 (사용자, 2026-04-08)**: 비자 옵션은 **있는 것 다 포함** + **드롭다운이 아닌 칩(chip)/토글 UI**로 표시. 클릭 한 번으로 선택 가능하게 해서 UX를 단순화.
   - **UI**: 카드/칩 형태, 가로 스크롤 또는 그리드, 1개 선택. 최종 옵션 리스트는 구현 시 개발팀장이 작성.

3. **Q**: 학과별 폼에 있던 `desired_industry`(희망 산업)는 어디서 받나?
   - **✅ 결정 (사용자, 2026-04-08)**: 커리어학과 자소서 빌더 0단계에서 받기. 본 PRD 범위 외.

4. **Q**: 마케팅학과의 `sns_accounts`, 디지털학과의 `has_own_device` 같은 정보는 언제 받나?
   - **✅ 결정 (사용자, 2026-04-08)**: **그냥 폐지**. 도구 첫 화면 온보딩으로도 옮기지 않음. 필요 시 개별 도구 안에서 자체 처리.

5. **Q**: 기존 사용자 보강 모달의 강제성 수준은?
   - **✅ 결정 (사용자, 2026-04-08)**: **(a) 강제**. 첫 로그인 시 신규 3개 필드(한국어/체류기간/비자) 입력 안 하면 사이트 이용 차단. 입력 완료 후 일반 사용 가능.
   - **구현**: 첫 로그인 시 풀스크린 보강 모달 → 3개 필드 입력 → 제출 → 메인 화면. 닫기 버튼·건너뛰기 없음.

6. **Q**: 인증코드 처리 방식은?
   - **✅ 결정 (사용자, 2026-04-08)**: 깍두기학교 가입 폼과 무관한 코드였음(마케팅 AI 도구 사이트 게이트의 잘못된 복붙). **완전 제거**. CEO는 사용자 본인(이미 존재), 강사는 CEO가 admin 패널에서 직접 생성.

7. **Q**: TOPIK 0-2 사용자 폴백은?
   - **✅ 결정 (사용자, 2026-04-08)**: **(b) 강화**. 한/영 병기 + i18n + **🌐 모국어 토글 버튼**(전체 폼 모국어로 전환) 추가. **TTS 음성 안내는 P1으로 미룸**.

---

## 14. 변경 로그 (Change Log)

| 버전 | 날짜 | 변경 |
|---|---|---|
| v1.0 | 2026-04-08 | 초안 작성 |
| v1.1 | 2026-04-08 | 사용자 결정 4건 반영 (1번 비허용+레거시 이관 / 2번 비자 칩UI / 3번 자소서 빌더 이동 / 4번 학과별 정보 폐지) |
| v1.2 | 2026-04-08 | 오픈 이슈 모두 해결 (5번 강제 모달 / 6번 인증코드 완전 제거 / 7번 모국어 토글 강화·TTS는 P1) |

---

## 15. 승인 (Approval)

- [ ] CEO (사용자) 승인
- [ ] 법무팀장 검토 (개인정보처리방침)
- [ ] DBA 검토 (마이그레이션 영향)
- [ ] 디자인팀장 검토 (UI)
- [ ] 개발팀장 검토 (구현 가능성)

승인 후 PM이 일정 수립 → 개발 착수.
