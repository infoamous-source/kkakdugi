-- ========================================================================
-- 가입 폼 v6 마이그레이션 (PRD: docs/prd-signup-form-v5.md)
-- 2026-04-08
--
-- 변경 사항:
--  1. profiles 테이블에 신규 컬럼 3개 추가
--     - korean_level   (TOPIK 0~6)
--     - years_in_korea (한국 체류 기간 6구간)
--     - visa_type      (비자 종류)
--  2. TEST_LEGACY 임시 기관 생성 (기관코드 없는 기존 사용자 일괄 이관용)
--  3. 무소속 학생을 TEST_LEGACY 기관으로 이관
--  4. 커리어학과 등록자의 school_profile에서 visa_type/korean_level 백필
-- ========================================================================

-- ─── 1. profiles 테이블 컬럼 추가 ───────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS korean_level    TEXT,
  ADD COLUMN IF NOT EXISTS years_in_korea  TEXT,
  ADD COLUMN IF NOT EXISTS visa_type       TEXT;

COMMENT ON COLUMN profiles.korean_level   IS 'TOPIK 수준: topik0~topik6';
COMMENT ON COLUMN profiles.years_in_korea IS '한국 체류 기간: under6m, 6m_1y, 1y_3y, 3y_5y, 5y_10y, over10y';
COMMENT ON COLUMN profiles.visa_type      IS '비자 종류: E7, E9, F2, F4, F5, F6, D2, D4, H2, other, none';

-- 인덱스 (필터/통계용)
CREATE INDEX IF NOT EXISTS idx_profiles_korean_level   ON profiles(korean_level);
CREATE INDEX IF NOT EXISTS idx_profiles_years_in_korea ON profiles(years_in_korea);
CREATE INDEX IF NOT EXISTS idx_profiles_visa_type      ON profiles(visa_type);

-- ─── 2. TEST_LEGACY 임시 기관 생성 ──────────────────────────────────────
-- 기관코드 없이 등록된 기존 사용자를 모아두는 임시 그룹.
-- 향후 CEO가 admin 패널에서 정식 기관으로 분배할 수 있도록 보존.
--
-- 주의: instructor_id가 NOT NULL인 경우 첫 CEO/instructor의 id를 사용.
-- 아래 INSERT는 기존 데이터에 의존하므로, 환경에 맞게 조정 필요.

DO $$
DECLARE
  legacy_instructor_id UUID;
BEGIN
  -- 첫 번째 CEO 또는 instructor 계정의 id를 가져옴 (소유자 지정용)
  SELECT id INTO legacy_instructor_id
  FROM profiles
  WHERE role IN ('ceo', 'instructor')
  ORDER BY created_at ASC
  LIMIT 1;

  -- CEO/instructor가 없는 경우는 마이그레이션 스킵
  IF legacy_instructor_id IS NULL THEN
    RAISE NOTICE 'No CEO/instructor found. Skipping TEST_LEGACY org creation.';
    RETURN;
  END IF;

  -- TEST_LEGACY 기관 생성 (이미 있으면 스킵)
  INSERT INTO organizations (instructor_id, name, code, program_types)
  SELECT
    legacy_instructor_id,
    'TEST 레거시 그룹 (Legacy Users)',
    'TESTLEGACY',
    ARRAY['digital-basics', 'marketing', 'career']::text[]
  WHERE NOT EXISTS (
    SELECT 1 FROM organizations WHERE code = 'TESTLEGACY'
  );
END $$;

-- ─── 3. 무소속 학생을 TEST_LEGACY 기관으로 이관 ─────────────────────────

UPDATE profiles
SET org_code = 'TESTLEGACY',
    updated_at = NOW()
WHERE role = 'student'
  AND (org_code IS NULL OR org_code = '');

-- ─── 4. 커리어학과 등록자의 신규 컬럼 백필 ──────────────────────────────
-- school_profiles.data JSONB에서 visa_type, korean_level을 profiles로 복사

UPDATE profiles p
SET
  korean_level = COALESCE(p.korean_level, sp.data->>'korean_level'),
  visa_type    = COALESCE(p.visa_type, sp.data->>'visa_type'),
  updated_at   = NOW()
FROM school_profiles sp
WHERE p.id = sp.student_id
  AND sp.school_id = 'career'
  AND (p.korean_level IS NULL OR p.visa_type IS NULL);

-- years_in_korea는 기존 데이터에 없으므로 NULL로 둠.
-- → 첫 로그인 시 강제 보강 모달에서 입력받음.

-- ========================================================================
-- 마이그레이션 완료
-- ========================================================================
