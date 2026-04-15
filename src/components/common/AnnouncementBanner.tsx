import { useState, useEffect, useCallback } from 'react';
import { X, Bell } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Announcement {
  id: string;
  title: string;
  content: string;
  target_org: string | null;
  target_role: string;
  created_at: string;
  expires_at: string | null;
  announcement_reads: { user_id: string }[];
}

export default function AnnouncementBanner() {
  const { user, isAuthenticated } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const fetchAnnouncements = useCallback(async () => {
    if (!isSupabaseConfigured || !isAuthenticated || !user) return;

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('announcements')
      .select('*, announcement_reads!left(user_id)')
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false });

    if (error || !data) return;

    // Filter: match target_org (null = all) and target_role, exclude already-read
    const unread = (data as Announcement[]).filter((a) => {
      // org filter
      if (a.target_org && a.target_org !== user.orgCode) return false;
      // role filter
      if (a.target_role !== 'all' && a.target_role !== user.role) return false;
      // already read?
      if (a.announcement_reads?.some((r) => r.user_id === user.id)) return false;
      return true;
    });

    setAnnouncements(unread);
    setCurrentIndex(0);
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleDismiss = async (announcementId: string) => {
    if (!user) return;

    // Mark as read in DB
    await supabase.from('announcement_reads').insert({
      announcement_id: announcementId,
      user_id: user.id,
    });

    setDismissed((prev) => new Set([...prev, announcementId]));

    // Move to next announcement
    if (currentIndex < announcements.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  // Filter out dismissed ones
  const visible = announcements.filter((a) => !dismissed.has(a.id));

  if (visible.length === 0) return null;

  const current = visible[0];

  return (
    <div className="relative mx-4 sm:mx-8 mt-2 mb-1 animate-[slideDown_0.3s_ease-out]">
      <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl px-4 py-3 shadow-md flex items-start gap-3">
        <Bell className="w-5 h-5 mt-0.5 flex-shrink-0 opacity-80" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-snug">{current.title}</p>
          <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{current.content}</p>
          {visible.length > 1 && (
            <p className="text-xs opacity-60 mt-1">+{visible.length - 1}개 더 보기</p>
          )}
        </div>
        <button
          onClick={() => handleDismiss(current.id)}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
          aria-label="닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
