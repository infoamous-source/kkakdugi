-- ============================================================
-- Supabase 데이터 작업 SQL
-- Supabase 대시보드 > SQL Editor에서 실행하세요
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 작업 1: org_code를 KKM394로 변경 (3개 계정)
-- ────────────────────────────────────────────────────────────

UPDATE profiles
SET org_code = 'KKM394', updated_at = now()
WHERE email IN (
  'petroika316@naver.com',
  'petroika316@gmail.com',
  'tndls7529@naver.com'
);

-- ────────────────────────────────────────────────────────────
-- 작업 2: 이름 변경 (2개 계정)
-- ────────────────────────────────────────────────────────────

UPDATE profiles SET name = 'JANEYOU', updated_at = now()
WHERE email = 'petroika316@naver.com';

UPDATE profiles SET name = 'PETROIKA', updated_at = now()
WHERE email = 'petroika316@gmail.com';

-- ────────────────────────────────────────────────────────────
-- 작업 3: 테스트 계정 5개 생성
-- auth.users INSERT → 트리거가 profiles 자동 생성
-- ────────────────────────────────────────────────────────────

-- 테스트 계정 1: EMILTS
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated',
  'test101@naver.com',
  crypt('Test1234!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"EMILTS","role":"student"}',
  ''
);

-- 테스트 계정 2: JASONTS
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated',
  'test102@naver.com',
  crypt('Test1234!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"JASONTS","role":"student"}',
  ''
);

-- 테스트 계정 3: OLIVIATS
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated',
  'test103@naver.com',
  crypt('Test1234!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"OLIVIATS","role":"student"}',
  ''
);

-- 테스트 계정 4: LIAMTS
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated',
  'test104@naver.com',
  crypt('Test1234!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"LIAMTS","role":"student"}',
  ''
);

-- 테스트 계정 5: SOPHIATS
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated',
  'test105@naver.com',
  crypt('Test1234!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"SOPHIATS","role":"student"}',
  ''
);

-- ────────────────────────────────────────────────────────────
-- 테스트 계정 profiles에 instructor_code, org_code 설정
-- (트리거가 profiles 생성 후 실행)
-- ────────────────────────────────────────────────────────────

UPDATE profiles
SET instructor_code = '123A', org_code = 'KKM394', updated_at = now()
WHERE email IN (
  'test101@naver.com',
  'test102@naver.com',
  'test103@naver.com',
  'test104@naver.com',
  'test105@naver.com'
);

-- ────────────────────────────────────────────────────────────
-- 확인 쿼리: 변경된 데이터 조회
-- ────────────────────────────────────────────────────────────

SELECT email, name, org_code, instructor_code, role, updated_at
FROM profiles
WHERE email IN (
  'petroika316@naver.com',
  'petroika316@gmail.com',
  'tndls7529@naver.com',
  'test101@naver.com',
  'test102@naver.com',
  'test103@naver.com',
  'test104@naver.com',
  'test105@naver.com'
)
ORDER BY email;
