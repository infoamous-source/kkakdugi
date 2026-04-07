-- 1교시 적성검사 결과를 학생증 뱃지로 저장하기 위한 컬럼 추가
-- mockup 확정안: 보석함 저장 제거 → profiles.marketing_persona 로 통일
-- 저장되는 값 예: 'CEO' | 'PM' | 'CPO' | 'CMO' | 'CSL'
--   (PersonaId 타입 — src/types/school.ts)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS marketing_persona TEXT;

COMMENT ON COLUMN public.profiles.marketing_persona IS
  '1교시 적성검사 결과 - 마케팅 페르소나 ID (CEO/PM/CPO/CMO/CSL). 졸업과제에서 조원 카드에 뱃지로 노출됨.';

-- RLS는 profiles 테이블의 기존 정책을 그대로 사용 (auth.uid() = id)
-- 별도 정책 추가 불필요
