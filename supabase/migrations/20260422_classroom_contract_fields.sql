-- classroom_groups에 수업 일정 + 계약 정보 통합
--
-- 배경: 기존 class_sessions(수업) 테이블이 사실상 빈 껍데기였고,
-- 실제 운영은 classroom_groups(교실)로 진행 중이었음.
-- 학생·강사·팀이 모두 교실에 모여 있으니, 계약 정보도 교실에 통합한다.
--
-- 추가 컬럼:
--   start_date      : 교실(수업) 시작일
--   end_date        : 교실(수업) 종료일
--   contract_days   : 종료일 이후 프로도구를 며칠 더 열어줄지 (기관마다 다름, 필수)
--   contract_until  : 보장 만료일(선택). 설정 시 (end_date + contract_days)와 비교해 더 늦은 날짜를 만료일로 사용
--
-- 적용 방법:
--   Supabase Dashboard → SQL Editor → 이 파일 내용 붙여넣기 → Run
--
-- 학생 만료일 계산 공식:
--   classroom_expiry = MAX(classroom.end_date + classroom.contract_days, classroom.contract_until)
--   student_expiry   = MAX over all classrooms the student belongs to
--
-- 같은 기관에 교실이 여러 개여도(예: A반·B반) 학생은 자기 소속 교실만 적용됨.

ALTER TABLE classroom_groups
  ADD COLUMN IF NOT EXISTS start_date     date    NULL,
  ADD COLUMN IF NOT EXISTS end_date       date    NULL,
  ADD COLUMN IF NOT EXISTS contract_days  integer NULL,
  ADD COLUMN IF NOT EXISTS contract_until date    NULL;

COMMENT ON COLUMN classroom_groups.start_date     IS '교실/수업 시작일';
COMMENT ON COLUMN classroom_groups.end_date       IS '교실/수업 종료일. 이 날짜 이후 contract_days가 적용됨';
COMMENT ON COLUMN classroom_groups.contract_days  IS '종료 후 프로도구 추가 사용 일수 (기관마다 다름)';
COMMENT ON COLUMN classroom_groups.contract_until IS '보장 만료일(선택). end_date+contract_days와 비교해 더 늦은 날짜를 사용';

-- 기존 운영 중인 교실(예비 마케터 교실 등) 마이그레이션 참고용:
-- 예) HUC454 예비 마케터 교실: 4/9~4/10 수업, 30일 계약, 5/17까지 보장
-- UPDATE classroom_groups
-- SET start_date='2026-04-09', end_date='2026-04-10', contract_days=30, contract_until='2026-05-17'
-- WHERE classroom_name='예비 마케터 교실';
