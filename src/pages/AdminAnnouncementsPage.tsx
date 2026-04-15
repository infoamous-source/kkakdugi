import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, ToggleLeft, ToggleRight, Bell, Send } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Announcement {
  id: string;
  title: string;
  content: string;
  target_org: string | null;
  target_role: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

export default function AdminAnnouncementsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetOrg, setTargetOrg] = useState('');
  const [targetRole, setTargetRole] = useState('student');
  const [expiresAt, setExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    // Fetch all announcements (active + inactive) for admin view
    // RLS only allows SELECT on active ones, so we use service role via rpc or just show what we can
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    setAnnouncements(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Auth guard
  if (!isAuthenticated || !user || (user.role !== 'instructor' && user.role !== 'ceo')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kk-bg">
        <p className="text-kk-brown/60">접근 권한이 없습니다.</p>
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from('announcements').insert({
      title: title.trim(),
      content: content.trim(),
      target_org: targetOrg.trim() || null,
      target_role: targetRole,
      created_by: user.id,
      expires_at: expiresAt || null,
    });

    if (!error) {
      setTitle('');
      setContent('');
      setTargetOrg('');
      setTargetRole('student');
      setExpiresAt('');
      setShowForm(false);
      fetchAll();
    }
    setSubmitting(false);
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    await supabase.from('announcements').update({ is_active: !currentActive }).eq('id', id);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await supabase.from('announcements').delete().eq('id', id);
    fetchAll();
  };

  return (
    <div className="min-h-screen bg-kk-bg">
      {/* Header */}
      <header className="bg-white border-b border-kk-warm/50 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-kk-cream/50 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-kk-brown" />
          </button>
          <Bell className="w-5 h-5 text-purple-600" />
          <h1 className="text-lg font-bold text-kk-brown">공지사항 관리</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Create button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          새 공지 작성
        </button>

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-xl border border-kk-warm/50 p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-kk-brown mb-1">제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-kk-warm rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="공지 제목"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-kk-brown mb-1">내용</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-kk-warm rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                placeholder="공지 내용을 입력하세요"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-kk-brown mb-1">대상 기관 (선택)</label>
                <input
                  type="text"
                  value={targetOrg}
                  onChange={(e) => setTargetOrg(e.target.value)}
                  className="w-full px-3 py-2 border border-kk-warm rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="비우면 전체 기관"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-kk-brown mb-1">대상 역할</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 border border-kk-warm rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="student">학생</option>
                  <option value="instructor">강사</option>
                  <option value="all">전체</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-kk-brown mb-1">만료일 (선택)</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 border border-kk-warm rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? '발송 중...' : '공지 발송'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
              >
                취소
              </button>
            </div>
          </form>
        )}

        {/* Announcements list */}
        {loading ? (
          <div className="text-center py-12 text-kk-brown/40 text-sm">불러오는 중...</div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 text-kk-brown/40 text-sm">공지사항이 없습니다.</div>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div
                key={a.id}
                className={`bg-white rounded-xl border p-4 ${
                  a.is_active ? 'border-kk-warm/50' : 'border-gray-200 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-bold text-kk-brown">{a.title}</h3>
                      {a.target_org && (
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                          {a.target_org}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">
                        {a.target_role === 'all' ? '전체' : a.target_role === 'student' ? '학생' : '강사'}
                      </span>
                      {!a.is_active && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">비활성</span>
                      )}
                    </div>
                    <p className="text-xs text-kk-brown/60 leading-relaxed">{a.content}</p>
                    <p className="text-xs text-kk-brown/30 mt-1">
                      {new Date(a.created_at).toLocaleDateString('ko-KR')}
                      {a.expires_at && ` ~ ${new Date(a.expires_at).toLocaleDateString('ko-KR')}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleToggle(a.id, a.is_active)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title={a.is_active ? '비활성화' : '활성화'}
                    >
                      {a.is_active ? (
                        <ToggleRight className="w-5 h-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
