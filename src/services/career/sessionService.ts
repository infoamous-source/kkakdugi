/**
 * 자소서 빌더 세션 Supabase 서비스
 *
 * localStorage와 Supabase를 이중 저장한다:
 * - localStorage: 오프라인 대응, 즉각 저장 (네트워크 불필요)
 * - Supabase: 기기 간 동기화, 관리자 조회, 데이터 영속성
 *
 * 쓰기(save)는 localStorage 먼저 → Supabase는 디바운스(2초)로 비동기.
 * 읽기(load)는 Supabase가 있으면 Supabase 우선, 없으면 localStorage 폴백.
 */

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { ResumeBuilderSession } from '../../hooks/useResumeBuilderSession';

/** Supabase에서 세션 로드 (user_id 기반) */
export async function loadSessionFromSupabase(
  userId: string,
): Promise<ResumeBuilderSession | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from('resume_builder_sessions')
      .select('session_data')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[sessionService] load error:', error.message);
      return null;
    }

    if (!data?.session_data) return null;
    return data.session_data as ResumeBuilderSession;
  } catch (e) {
    console.error('[sessionService] load exception:', e);
    return null;
  }
}

/** Supabase에 세션 저장 (upsert — user_id 기준 1개만 유지) */
export async function saveSessionToSupabase(
  userId: string,
  session: ResumeBuilderSession,
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const { error } = await supabase
      .from('resume_builder_sessions')
      .upsert(
        {
          user_id: userId,
          session_data: session,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );

    if (error) {
      console.error('[sessionService] save error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[sessionService] save exception:', e);
    return false;
  }
}

/** Supabase에서 세션 삭제 */
export async function deleteSessionFromSupabase(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const { error } = await supabase
      .from('resume_builder_sessions')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('[sessionService] delete error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[sessionService] delete exception:', e);
    return false;
  }
}
