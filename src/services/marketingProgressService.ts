import { supabase } from '../lib/supabase';

export interface MarketingProgressRow {
  id: string;
  user_id: string;
  module_id: string;
  viewed_at: string | null;
  tool_used_at: string | null;
  tool_output_count: number;
  completed_at: string | null;
  updated_at: string;
}

export async function fetchMarketingProgress(userId: string): Promise<MarketingProgressRow[]> {
  const { data, error } = await supabase
    .from('marketing_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Fetch marketing progress error:', error.message);
    return [];
  }
  return data as MarketingProgressRow[];
}

export async function upsertMarketingProgress(
  userId: string,
  moduleId: string,
  data: Partial<{
    viewedAt: string;
    toolUsedAt: string;
    toolOutputCount: number;
    completedAt: string;
  }>,
): Promise<boolean> {
  const updates: Record<string, unknown> = {
    user_id: userId,
    module_id: moduleId,
    updated_at: new Date().toISOString(),
  };

  if (data.viewedAt !== undefined) updates.viewed_at = data.viewedAt;
  if (data.toolUsedAt !== undefined) updates.tool_used_at = data.toolUsedAt;
  if (data.toolOutputCount !== undefined) updates.tool_output_count = data.toolOutputCount;
  if (data.completedAt !== undefined) updates.completed_at = data.completedAt;

  const { error } = await supabase
    .from('marketing_progress')
    .upsert(updates, { onConflict: 'user_id,module_id' });

  if (error) {
    console.error('Upsert marketing progress error:', error.message);
    return false;
  }
  return true;
}
