-- ========================================================================
-- 자소서 빌더 세션 테이블 (localStorage → Supabase 승격)
-- 2026-04-13
--
-- 현재까지 localStorage에만 저장하던 자소서 빌더 세션 데이터를
-- Supabase 테이블로 승격한다.
--
-- 장점:
--  - 기기 간 동기화 (모바일 ↔ PC)
--  - 브라우저 데이터 삭제해도 세션 유지
--  - 관리자가 학생 진행 상황 조회 가능
--  - 통계·분석 가능
-- ========================================================================

CREATE TABLE IF NOT EXISTS resume_builder_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_data  JSONB NOT NULL DEFAULT '{}',
  -- session_data 안에는 useResumeBuilderSession의 전체 상태가 들어감:
  -- currentStep, selectedCardIds, quizAnswers, resultStrengths,
  -- interviewAnswers, resumeTarget, resumeDrafts, kResumes, interviewPractices 등

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 사용자당 1개 세션 (최신 것만 유지, 앱에서 upsert)
CREATE UNIQUE INDEX IF NOT EXISTS idx_rbs_user_id ON resume_builder_sessions(user_id);

-- RLS 정책: 본인만 접근
ALTER TABLE resume_builder_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY rbs_select_own ON resume_builder_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY rbs_insert_own ON resume_builder_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY rbs_update_own ON resume_builder_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY rbs_delete_own ON resume_builder_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- 관리자(instructor/ceo)는 모든 세션 조회 가능
CREATE POLICY rbs_admin_select ON resume_builder_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('instructor', 'ceo')
    )
  );

-- ========================================================================
-- 마이그레이션 완료
-- ========================================================================
