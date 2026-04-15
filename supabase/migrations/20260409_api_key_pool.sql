-- Group API Key Pool: organizations 테이블에 api_key_pool 컬럼 추가
-- 같은 기관 소속 학생들의 Gemini API 키를 풀로 묶어 라운드 로빈 순환

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS api_key_pool TEXT[] DEFAULT '{}';

-- HUC454 (서울글로벌센터) 학생들의 기존 키로 풀 초기화
UPDATE organizations SET api_key_pool = (
  SELECT ARRAY_AGG(DISTINCT gemini_api_key)
  FROM profiles
  WHERE UPPER(org_code) = 'HUC454'
    AND role = 'student'
    AND gemini_api_key IS NOT NULL
    AND gemini_api_key != ''
)
WHERE code = 'HUC454';
