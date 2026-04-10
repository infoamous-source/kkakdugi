import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MessageCircle, Lock, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import KkakdugiMascot from '../components/brand/KkakdugiMascot';

interface Inquiry {
  id: number;
  message: string;
  phone: string;
  reply: string | null;
  replied_at: string | null;
  created_at: string;
  is_read: boolean;
}

export default function InquiryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadInquiries();
  }, [user]);

  const loadInquiries = async () => {
    const { data } = await supabase
      .from('inquiries')
      .select('id, message, phone, reply, replied_at, created_at, is_read')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setInquiries(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim() || !phone.trim()) return;
    setSubmitting(true);
    try {
      await supabase.from('inquiries').insert({
        user_id: user.id,
        name: user.name,
        email: user.email,
        phone: phone.trim(),
        message: message.trim(),
      });
      setMessage('');
      setPhone('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      await loadInquiries();
    } catch (err) {
      console.error('Inquiry submit error:', err);
      alert('문의 등록에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-kk-bg flex items-center justify-center p-6">
        <p className="text-kk-brown">로그인이 필요합니다</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kk-bg pb-24">
      {/* Header */}
      <header className="bg-white border-b border-kk-warm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-kk-cream rounded-lg">
            <ArrowLeft className="w-5 h-5 text-kk-brown" />
          </button>
          <KkakdugiMascot size={20} />
          <h1 className="font-bold text-kk-brown">1:1 문의하기</h1>
          <Lock className="w-4 h-4 text-kk-brown/40 ml-auto" />
          <span className="text-xs text-kk-brown/40">비밀글</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* 새 문의 작성 */}
        <div className="bg-white rounded-2xl border border-kk-warm p-5">
          <h2 className="font-semibold text-kk-brown mb-1 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-kk-red" />
            새 문의 작성
          </h2>
          <p className="text-xs text-kk-brown/50 mb-4">
            선생님에게만 보이는 비밀글이에요. 편하게 질문해주세요!
          </p>

          {submitted && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              문의가 등록되었어요! 선생님이 곧 확인할게요.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                연락처 (전화번호) *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-kk-red focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                문의 내용 *
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="안 되는 것, 궁금한 것, 건의사항 등 자유롭게 적어주세요"
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-kk-red focus:border-transparent resize-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !message.trim() || !phone.trim()}
              className="w-full py-3 bg-kk-red hover:bg-kk-red-deep text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? '보내는 중...' : '문의 보내기'}
            </button>
          </form>
        </div>

        {/* 내 문의 내역 */}
        <div>
          <h2 className="font-semibold text-kk-brown mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            내 문의 내역
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-kk-red mx-auto" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-8 text-kk-brown/40 text-sm">
              아직 문의 내역이 없어요
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map(inq => (
                <div key={inq.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  {/* 내 질문 */}
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-kk-red">내 문의</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(inq.created_at).toLocaleDateString('ko-KR', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{inq.message}</p>
                  </div>

                  {/* 선생님 답글 */}
                  {inq.reply ? (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-green-600">✅ 선생님 답변</span>
                        <span className="text-[10px] text-gray-400">
                          {inq.replied_at && new Date(inq.replied_at).toLocaleDateString('ko-KR', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap bg-green-50 rounded-lg p-3">{inq.reply}</p>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      답변 대기 중...
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
