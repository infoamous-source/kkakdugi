-- classroom_groups에 archived_at 컬럼 추가 (소프트 삭제)
-- NULL = 활성, 값 있음 = 보관됨(숨김)
--
-- UI에서는 archived_at IS NULL 필터로 활성 교실만 표시.
-- 데이터는 DB에 남아있어 언제든 복구·조회 가능.

ALTER TABLE classroom_groups
  ADD COLUMN IF NOT EXISTS archived_at timestamptz NULL;

COMMENT ON COLUMN classroom_groups.archived_at IS '보관 처리(숨김) 시각. NULL이면 활성 교실. UI는 NULL인 것만 표시';

-- 연습용 교실 4개 한꺼번에 보관 처리
UPDATE classroom_groups
SET archived_at = NOW()
WHERE classroom_name IN ('디지털 기초반', '커리어 준비반', '원주1기', '1')
  AND archived_at IS NULL;
