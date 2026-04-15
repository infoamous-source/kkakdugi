import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Send, MessageCircle, CheckCircle2, Loader2, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Inquiry {
  id: number;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  reply: string | null;
  replied_at: string | null;
  is_read: boolean;
  created_at: string;
}

export default function AdminInquiryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user || user.role === 'student') return;
    loadInquiries();
  }, [user]);

  const loadInquiries = async () => {
    const { data } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    setInquiries(data || []);
    setLoading(false);
  };

  const handleReply = async (inqId: number) => {
    if (!replyText.trim() || !user) return;
    setSubmitting(true);
    try {
      await supabase
        .from('inquiries')
        .update({
          reply: replyText.trim(),
          replied_at: new Date().toISOString(),
          replied_by: user.id,
          is_read: true,
        })
        .eq('id', inqId);
      setReplyText('');
      setReplyingId(null);
      await loadInquiries();
    } catch (err) {
      console.error('Reply error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'student') {
    return <Navigate to="/" replace />;
  }

  const unreplied = inquiries.filter(i => !i.reply).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <MessageCircle className="w-5 h-5 text-kk-red" />
          <h1 className="font-bold">학생 문의 관리</h1>
          {unreplied > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreplied}건 미답변
            </span>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">문의가 없습니다</div>
        ) : (
          <div className="space-y-4">
            {inquiries.map(inq => (
              <div key={inq.id} className={`bg-white rounded-xl border p-5 ${!inq.reply ? 'border-red-200' : 'border-gray-200'}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-semibold text-sm">{inq.name}</span>
                    <span className="text-xs text-gray-400 ml-2">{inq.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`tel:${inq.phone}`} className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                      <Phone className="w-3 h-3" />
                      {inq.phone}
                    </a>
                    {inq.reply ? (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> 답변 완료
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-lg">미답변</span>
                    )}
                  </div>
                </div>

                {/* 문의 내용 */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{inq.message}</p>
                  <p className="text-[10px] text-gray-400 mt-2">
                    {new Date(inq.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>

                {/* 기존 답변 */}
                {inq.reply && (
                  <div className="bg-green-50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-green-600 font-medium mb-1">선생님 답변:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{inq.reply}</p>
                    <p className="text-[10px] text-gray-400 mt-2">
                      {inq.replied_at && new Date(inq.replied_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                )}

                {/* 답변 작성 */}
                {replyingId === inq.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="답변을 작성하세요"
                      rows={3}
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-kk-red resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReply(inq.id)}
                        disabled={submitting || !replyText.trim()}
                        className="flex-1 py-2 bg-kk-red text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        답변 보내기
                      </button>
                      <button
                        onClick={() => { setReplyingId(null); setReplyText(''); }}
                        className="px-4 py-2 bg-gray-100 rounded-xl text-sm"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setReplyingId(inq.id); setReplyText(inq.reply || ''); }}
                    className="text-xs text-kk-red hover:underline"
                  >
                    {inq.reply ? '답변 수정' : '답변 작성'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
