import { supabase } from '../lib/supabase';

// ─── Types ───

export type AlertType =
  | 'api_quota'
  | 'api_model_block'
  | 'pexels_fail'
  | 'blank_screen'
  | 'login_fail'
  | 'rls_deny'
  | 'save_fail'
  | 'siren';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface SystemAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  affected_users: number;
  metadata: Record<string, unknown>;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

// ─── Cooldown (같은 타입 5분 내 중복 방지) ───

const COOLDOWN_KEY = 'sys-alert-cooldown';
const COOLDOWN_MS = 5 * 60 * 1000;

function canSendAlert(type: string): boolean {
  try {
    const cooldowns = JSON.parse(sessionStorage.getItem(COOLDOWN_KEY) || '{}');
    const lastSent = cooldowns[type];
    if (lastSent && Date.now() - lastSent < COOLDOWN_MS) return false;
    cooldowns[type] = Date.now();
    sessionStorage.setItem(COOLDOWN_KEY, JSON.stringify(cooldowns));
    return true;
  } catch {
    return true;
  }
}

// ─── API ───

export async function sendSystemAlert(
  type: AlertType,
  severity: AlertSeverity,
  title: string,
  description: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  if (!canSendAlert(type)) return;

  try {
    await supabase.from('system_alerts').insert({
      type,
      severity,
      title,
      description,
      metadata: metadata || {},
    });
  } catch (err) {
    console.error('[SystemAlert] Failed to send:', err);
  }
}

export async function getActiveAlerts(): Promise<SystemAlert[]> {
  const { data } = await supabase
    .from('system_alerts')
    .select('*')
    .eq('is_resolved', false)
    .order('created_at', { ascending: false })
    .limit(20);
  return (data || []) as SystemAlert[];
}

export async function resolveAlert(alertId: string, userId: string): Promise<void> {
  await supabase
    .from('system_alerts')
    .update({ is_resolved: true, resolved_at: new Date().toISOString(), resolved_by: userId })
    .eq('id', alertId);
}

export async function getAllAlerts(limit = 50): Promise<SystemAlert[]> {
  const { data } = await supabase
    .from('system_alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data || []) as SystemAlert[];
}
