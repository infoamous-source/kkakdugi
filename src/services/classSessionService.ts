import { supabase } from '../lib/supabase';
import type { ClassSessionRow } from '../types/database';

// ─── CRUD ───

export async function getClassSessions(): Promise<ClassSessionRow[]> {
  const { data, error } = await supabase
    .from('class_sessions')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Get class sessions error:', error.message);
    return [];
  }
  return data as ClassSessionRow[];
}

export async function createClassSession(
  session: Omit<ClassSessionRow, 'id' | 'created_at' | 'updated_at'>,
): Promise<ClassSessionRow | null> {
  const { data, error } = await supabase
    .from('class_sessions')
    .insert(session)
    .select()
    .single();

  if (error) {
    console.error('Create class session error:', error.message);
    return null;
  }
  return data as ClassSessionRow;
}

export async function updateClassSession(
  id: string,
  updates: Partial<Pick<ClassSessionRow, 'org_name' | 'org_code' | 'title' | 'start_date' | 'end_date' | 'instructor_name' | 'instructor_id' | 'status' | 'notes'>>,
): Promise<boolean> {
  const { error } = await supabase
    .from('class_sessions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Update class session error:', error.message);
    return false;
  }
  return true;
}

export async function deleteClassSession(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('class_sessions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete class session error:', error.message);
    return false;
  }
  return true;
}
